(() => {
const topbar = document.querySelector('.topbar');
const rightTop = document.querySelector('.right-top');
const overallBox = document.getElementById('overallBox');
const titleInput = document.getElementById('titleInput');
const subjectsScroll = document.getElementById('subjectsContainer');

if (topbar && rightTop && overallBox && titleInput) {
  let lastScroll = 0;
  const THRESH = 25;

  const getScroll = () =>
    subjectsScroll && subjectsScroll.scrollHeight > subjectsScroll.clientHeight
      ? subjectsScroll.scrollTop
      : window.pageYOffset || document.documentElement.scrollTop || 0;

  function handleScroll() {
    if (window.innerWidth > 768) {
      // reset on desktop
      topbar.classList.remove('collapsed');
      rightTop.classList.remove('hide-toolbar');
      overallBox.classList.remove('hide-toolbar');
      titleInput.classList.remove('only-title');
      lastScroll = getScroll();
      return;
    }

    const current = getScroll();
    const diff = current - lastScroll;
    if (Math.abs(diff) < THRESH) return;

    if (diff > 0 && current > 50) {
      // scrolling down → collapse all except title
      topbar.classList.add('collapsed');
      rightTop.classList.add('hide-toolbar');
      overallBox.classList.add('hide-toolbar');
      titleInput.classList.add('only-title');
    } else if (diff < 0) {
      // scrolling up → expand everything
      topbar.classList.remove('collapsed');
      rightTop.classList.remove('hide-toolbar');
      overallBox.classList.remove('hide-toolbar');
      titleInput.classList.remove('only-title');
    }

    lastScroll = current;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  if (subjectsScroll)
    subjectsScroll.addEventListener('scroll', handleScroll, { passive: true });

  window.addEventListener('resize', () => {
    lastScroll = getScroll();
    if (window.innerWidth > 768) {
      topbar.classList.remove('collapsed');
      rightTop.classList.remove('hide-toolbar');
      overallBox.classList.remove('hide-toolbar');
      titleInput.classList.remove('only-title');
    }
  });
}
/* ==================== END Scroll Hide ==================== */


  /* ==================== State and Storage ==================== */
  const LS_KEY = "study_progress_data_v7";
  let state = {
    title: "",
    subjects: [],
    settings: {
      mode: "chapters",
      defaultColor: "#dbeafe",
      colors: {
        low: "#fde8e8",
        mid: "#fff5cc",
        high: "#d7f7d7",
        full: "#a5f3a5",
      },
    },
  };
  let currentlySwipedRow = null; 

  const $ = (id) => document.getElementById(id);
  const subjectTpl = document.getElementById("subjectTpl");
  const chapterTpl = document.getElementById("chapterTpl");
  const subjectsContainer = $("subjectsContainer");

  const idGen = (p = "id") => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  const chapterCompleted = (ch) => ch.goal > 0 && ch.solved >= ch.goal;


/* ==================== Custom Color Gradient ==================== */

// Function to smoothly transition from Red (0) to Green (120) using HSL
// p: percentage (0 to 100)
function getColorShade(p) {
  // Ensure percentage is clamped between 0 and 100
  const percent = Math.max(0, Math.min(100, p));
  
  // Hue ranges from Red (0) to Green (120). 
  // We reverse the range so 0% is Red (0) and 100% is Green (120).
  const hue = percent * 1.2; // 120 / 100 = 1.2
  
  // Set a constant Saturation and Lightness for a pastel/light shade (you can adjust these)
  const saturation = 70; // %
  let lightness = 85; // % - adjusted to be a light shade for better text contrast
  
  // Optionally: Make the background slightly darker for 100% completion
  if (percent >= 100) {
      lightness = 75; 
  }

  // Use the calculated hue, saturation, and lightness to return an HSL color string
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}


// Modified colorForPercent to use the gradient function
function colorForPercent(p) {
  // The color change is based on every 5% progression, so we don't need to segment it.
  // The gradient function handles the smooth transition based on the actual percentage.
  return getColorShade(p);
}

  /* ==================== Save Indicator ==================== */
  const saveIndicator = (() => {
    const el = document.createElement("div");
    el.id = "saveIndicator";
    el.textContent = "💾 Saved";
    document.body.appendChild(el);
    return {
      show() {
        el.classList.add("visible");
        clearTimeout(el._timer);
        el._timer = setTimeout(() => el.classList.remove("visible"), 1500);
      },
    };
  })();

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    saveIndicator.show();
  }

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) {
      console.warn("Load error:", e);
    }
  }

  /* ==================== Calculations ==================== */
  function subjectPercent(subj) {
    const chapters = subj.parts.flatMap(p => p.chapters);
    if (!chapters.length) return 0;
    const done = chapters.filter(chapterCompleted).length;
    return Math.round((done / chapters.length) * 100);
  }

  function overallStats() {
    const chapters = state.subjects.flatMap(s => s.parts.flatMap(p => p.chapters));
    const total = chapters.length;
    const done = chapters.filter(chapterCompleted).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { pct, summary: `Completed ${done}/${total} chapters` };
  }

  function playSound(audio) {
            audio.valume = 0.8;
            audio.pause();
            audio.currentTime = 0;
            audio.play().catch(e => console.warn("Audio playback blocked:", e)); 
          }
          
  /* ==================== Rendering ==================== */
  function render() {
    subjectsContainer.innerHTML = "";

    if (!state.subjects.length) {
      subjectsContainer.innerHTML = `<div class="empty-note">No subjects yet — click "＋ Subject" to add one.</div>`;
      updateOverall();
      return;
    }

    state.subjects.forEach((subj) => {
      const node = subjectTpl.content.cloneNode(true);
      const sEl = node.querySelector(".subject");
      const header = sEl.querySelector(".subject-header");

      // Subject color
      header.style.background = subj.color || state.settings.defaultColor;

      // Subject name
      const nameEl = sEl.querySelector(".subject-name");
      nameEl.textContent = subj.name || "New Subject";
      nameEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault(), nameEl.blur();
      });
      nameEl.addEventListener("blur", () => {
        subj.name = nameEl.textContent.trim();
        save();
      });

      // Color picker
      const colorInp = sEl.querySelector(".subject-color");
      colorInp.value = subj.color || state.settings.defaultColor;
      colorInp.addEventListener("input", (e) => {
        header.style.background = e.target.value;
      });
      colorInp.addEventListener("change", (e) => {
        subj.color = e.target.value;
        save();
        render();
      });

      // Progress
      const spct = subjectPercent(subj);
      const fill = sEl.querySelector(".subject-progress-fill");
      fill.style.width = spct + "%";
      fill.style.background = "#60a5fa";
      sEl.querySelector(".subject-pct").textContent = spct + "%";

      // Add & remove part
      sEl.querySelector(".add-part").onclick = () => {
        subj.parts.push({ id: idGen("part"), name: "New Part", chapters: [] });
        save();
        render();
      };
      sEl.querySelector(".remove-subject").onclick = () => {
        if (!confirm("Delete this subject?")) return;
        state.subjects = state.subjects.filter(x => x.id !== subj.id);
        save();
        render();
      };

      // Parts
      const partsRow = sEl.querySelector(".parts-row");
      partsRow.innerHTML = "";
      subj.parts.forEach((part, pIdx) => {
        const col = document.createElement("div");
        col.className = "part-col";

        const pHeader = document.createElement("div");
        pHeader.className = "part-header";
        const pName = document.createElement("div");
        pName.className = "part-name";
        pName.textContent = part.name;
        pName.contentEditable = true;
        pName.addEventListener("keydown", (e) => {
          if (e.key === "Enter") e.preventDefault(), pName.blur();
        });
        pName.addEventListener("blur", () => {
          part.name = pName.textContent.trim();
          save();
        });

        const pActions = document.createElement("div");
        pActions.className = "part-actions";
        const addCh = document.createElement("button");
        addCh.textContent = "+ Chapter";
        addCh.className = "small";
        addCh.onclick = () => {
          part.chapters.push({
            id: idGen("chap"),
            name: "New Chapter",
            goal: 100,
            solved: 0,
            checked: false,
          });
          save();
          render();
        };
        const delPart = document.createElement("button");
        delPart.textContent = "Delete";
        delPart.className = "small danger";
        delPart.onclick = () => {
          if (!confirm("Delete this part?")) return;
          subj.parts.splice(pIdx, 1);
          save();
          render();
        };
        pActions.append(addCh, delPart);
        pHeader.append(pName, pActions);
        col.appendChild(pHeader);

        const chList = document.createElement("div");
        chList.className = "chapters-list";
        part.chapters.forEach((ch, cIdx) => {
          const crow = chapterTpl.content.cloneNode(true);
          const row = crow.querySelector(".chapter-row");

          // const p = ch.goal ? Math.round((ch.solved / ch.goal) * 100) : 0;
            const p = ch.goal ? parseFloat(((ch.solved / ch.goal) * 100).toFixed(2)) : 0;

          row.style.background = colorForPercent(p);

          const chk = row.querySelector(".chap-check");
          chk.checked = !!ch.checked;
          chk.onchange = () => {
            ch.checked = chk.checked;
            if (chk.checked) {
              ch.solved = ch.goal;
              playSound( new Audio('positive.wav'));
            }
            else ch.solved = 0;
            save();
            render();
          };

          const cname = row.querySelector(".chap-name");
          cname.textContent = ch.name;
          cname.addEventListener("keydown", (e) => {
            if (e.key === "Enter") e.preventDefault(), cname.blur();
          });
          cname.addEventListener("blur", () => {
            ch.name = cname.textContent.trim();
            save();
          });

          const goalSpan = row.querySelector(".goal-value");
          goalSpan.textContent = ch.goal || 0;
          goalSpan.addEventListener("dblclick", () => {
            const val = prompt("Set new goal:", ch.goal);
            if (val === null) return;
            const n = parseInt(val);
            if (!isNaN(n)) {
              ch.goal = n;
              if (ch.solved > ch.goal) ch.solved = ch.goal;
              save();
              render();
            }
          });



          let touchTimer;
          let touchTimer2;
          goalSpan.addEventListener('dblclick', () => openGoalPrompt());
          goalSpan.addEventListener('contextmenu', e => {
            e.preventDefault();
            openGoalPrompt();
          });
          goalSpan.addEventListener('touchstart', () => {
            touchTimer = setTimeout(() => openGoalPrompt(), 800);
          });
          goalSpan.addEventListener('touchend', () => clearTimeout(touchTimer));
          goalSpan.addEventListener('touchmove', () => clearTimeout(touchTimer));
          goalSpan.addEventListener('touchcancel', () => clearTimeout(touchTimer));

          function openGoalPrompt() {
            const val = prompt("Set goal (e.g. 100 MCQs)", ch.goal || 0);
            if (val === null) return;
            const n = parseInt(val);
            if (!isNaN(n)) {
              ch.goal = n;
              if (ch.solved > ch.goal) ch.solved = ch.goal;
              if (ch.solved >= ch.goal) ch.checked = true;
              goalSpan.textContent = ch.goal;
              save();
              render();
            }
          }
          const prog = row.querySelector(".chap-progress .fill");
          prog.style.width = p + "%";
          prog.style.background = "#60a5fa";
          row.querySelector(".chap-progress span").textContent = p + "%";

          const solvedSpan = row.querySelector(".solved-value");
          solvedSpan.textContent = ch.solved;          
          const incBtn = document.createElement("button");
          incBtn.textContent = "＋";
          incBtn.className = "solved-inc small";
          
          solvedSpan.addEventListener('contextmenu', e => {
            e.preventDefault();
          });

          solvedSpan.addEventListener('touchstart', () => {
            touchTimer2 = setTimeout(() => openSolvedPrompt(), 800);
          });
          solvedSpan.addEventListener('touchend', () => clearTimeout(touchTimer2));
          solvedSpan.addEventListener('touchmove', () => clearTimeout(touchTimer2));
          solvedSpan.addEventListener('touchcancel', () => clearTimeout(touchTimer2));
          

          function openSolvedPrompt() {
            const val = prompt("Set solved (e.g. 100 MCQs)", ch.solved || 0);
            if (val === null) return;
            const n = parseInt(val);
            if (!isNaN(n)) {
              ch.solved = n;
              if (ch.solved > ch.goal) ch.solved = ch.goal;
              if (ch.solved >= ch.goal) {
                ch.checked = true;
                playSound(new Audio('positive.wav'));
              }
              solvedSpan.textContent = ch.solved;
              save();
              render();
            }
          }
          incBtn.onclick = () => {
            ch.solved++;
            if (ch.solved > ch.goal) ch.solved = ch.goal;

          
            // Add animation class
            incBtn.classList.add("animate");

            // Remove class after animation ends
            incBtn.addEventListener("animationend", () => {
              incBtn.classList.remove("animate");
            }, { once: true });

            // Delay render slightly so animation is visible
            setTimeout(() => {
              save();
              render();
              playSound(new Audio('correct.wav'));
            }, 300); // match your CSS animation duration

          };


          const decBtn = document.createElement("button");
          decBtn.textContent = "−";
          decBtn.className = "solved-dec small";
          decBtn.onclick = () => {
            ch.solved = Math.max(0, ch.solved - 1);
            save();
            render();
          };

          row.querySelector(".chap-solved").append(incBtn, decBtn);
          
          row.querySelector(".del-ch").onclick = () => {
            if (!confirm("Delete this chapter?")) return;
            part.chapters.splice(cIdx, 1);
            save();
            render();
          };


          chList.appendChild(row);
        });

        col.appendChild(chList);
        partsRow.appendChild(col);
      });

      sEl.appendChild(partsRow);
      subjectsContainer.appendChild(sEl);
    });

    updateOverall();
  }
  // render finish ===============



  function updateOverall() {
    const { pct, summary } = overallStats();
    $("overallPct").textContent = pct + "%";
    $("overallBar").querySelector(".progress-fill").style.width = pct + "%";
    $("overallSummary").textContent = summary;
  }

  /* ==================== Buttons ==================== */
  $("btnAddSubject").onclick = () => {
    const subj = {
      id: idGen("subj"),
      name: "New Subject",
      color: state.settings.defaultColor,
      parts: [
        { id: idGen("part"), name: "Part 1", chapters: [] },
        { id: idGen("part"), name: "Part 2", chapters: [] },
      ],
    };
    state.subjects.push(subj);
    save();
    render();
  };

  $("btnClear").onclick = () => {
    if (!confirm("Clear all data?")) return;
    state.subjects = [];
    save();
    render();
  };

  $("btnExport").onclick = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "study_progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  $("btnImport").onclick = () => $("importFile").click();
  $("importFile").onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!confirm("Importing will replace your current data. Continue?")) return;
        state = parsed;
        save();
        render();
        $("titleInput").value = state.title || "";
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(f);
  };

  /* ==================== Title Save ==================== */
  $("titleInput").addEventListener("blur", () => {
    state.title = $("titleInput").value.trim();
    save();
  });

  /* ==================== Init ==================== */
  load();
  $("titleInput").value = state.title || "";
  render();
})();
