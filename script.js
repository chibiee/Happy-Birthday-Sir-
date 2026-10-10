(function () {
    var root = document.documentElement;
    var song = document.getElementById("song");
    var musicBtn = document.getElementById("music");
    var msgs = Array.prototype.slice.call(document.querySelectorAll("#stage .msg"));
    var panel = document.getElementById("timing");
    var clock = document.getElementById("clock");
    var marksEl = document.getElementById("marks");
    var marks = [];
    var useClock = false;   // kapag walang audio file, gagamit ng sariling orasan para makita pa rin ang takbo
    var t0 = 0;
    var running = false;
    var active = -1;
 
    // hatiin sa mga salita para isa-isang lumabas
    msgs.forEach(function (m) {
      var t = m.querySelector(".t");
      if (!t) return;
      var words = t.textContent.trim().split(/\s+/);
      t.setAttribute("aria-label", words.join(" "));
      t.textContent = "";
      words.forEach(function (w, i) {
        var s = document.createElement("span");
        s.className = "w";
        s.setAttribute("aria-hidden", "true");
        s.style.setProperty("--i", i);
        s.textContent = w;
        t.appendChild(s);
      });
    });
 
    function now() {
      return useClock ? (performance.now() - t0) / 1000 : song.currentTime;
    }
 
    function setActive(i) {
      if (i === active) return;
      active = i;
      msgs.forEach(function (m, k) { m.classList.toggle("on", k === i); });
    }
 
    function tick() {
      var t = now();
      var best = -1, bestAt = -1;
      for (var k = 0; k < msgs.length; k++) {
        var a = parseFloat(msgs[k].getAttribute("data-at"));
        if (a <= t && a > bestAt) { best = k; bestAt = a; }
      }
      setActive(best);
      clock.textContent = t.toFixed(1) + " s";
      requestAnimationFrame(tick);
    }
 
    function fallbackToClock() {
      useClock = true;
      t0 = performance.now();
      musicBtn.hidden = true;
    }
 
    function playSong() {
      var p = song.play();
      if (p && p.catch) p.catch(fallbackToClock);
    }
 
    song.addEventListener("error", fallbackToClock);
 
    document.getElementById("start").addEventListener("click", function () {
      root.classList.add("started");
      t0 = performance.now();
      musicBtn.hidden = useClock;
      playSong();
      window.scrollTo(0, 0);
      if (!running) { running = true; tick(); }
    });
 
    musicBtn.addEventListener("click", function () {
      if (song.paused) { playSong(); musicBtn.textContent = "Music: On"; }
      else { song.pause(); musicBtn.textContent = "Music: Off"; }
    });
 
    document.getElementById("again").addEventListener("click", function () {
      t0 = performance.now();
      try { song.currentTime = 0; } catch (e) {}
      if (!useClock) { playSong(); musicBtn.textContent = "Music: On"; }
    });
 
    // kung walang mahanap na photo, magpapakita ng paalala sa halip na sirang larawan
    var photo = document.getElementById("photo");
    var photoImg = photo && photo.querySelector("img");
    function noPhoto() { photo.classList.add("empty"); }
    if (photoImg) {
      photoImg.addEventListener("error", noPhoto);
      if (photoImg.complete && photoImg.naturalWidth === 0) noPhoto();
    }
 
    // timing mode: buksan ang page na may #timing sa dulo ng address
    if (location.hash === "#timing") {
      panel.hidden = false;
      song.controls = true;
      panel.appendChild(song);
      document.getElementById("mark").addEventListener("click", function () {
        marks.push(now().toFixed(1));
        marksEl.textContent = marks.join(", ");
      });
    }
  })();