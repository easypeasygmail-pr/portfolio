(function () {
  const header = document.querySelector("header");
  const toggle = header.querySelector("button");
  const menuIcon = toggle.innerHTML;
  const closeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x size-5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg><span class="sr-only">Zamknij menu</span>';

  const nav = document.createElement("nav");
  nav.id = "menu-mobilne";
  nav.className = "hidden border-t border-line bg-bg px-5 py-4 lg:hidden";
  nav.setAttribute("aria-label", "Mobilne");
  nav.innerHTML =
    '<ul class="flex flex-col">' +
    [
      ["#start", "Start"],
      ["#projekty", "Projekty"],
      ["#o-mnie", "O mnie"],
      ["#umiejetnosci", "Umiejętności"],
      ["#kontakt", "Kontakt"],
    ]
      .map(
        ([href, label]) =>
          '<li><a href="' +
          href +
          '" class="flex min-h-12 items-center border-b border-line text-lg">' +
          label +
          "</a></li>",
      )
      .join("") +
    '<li><a href="#kontakt" class="mt-4 inline-flex min-h-12 items-center gap-2 rounded-pill bg-cyan px-5 font-medium text-bg">Współpraca</a></li></ul>';
  header.appendChild(nav);

  function setOpen(open) {
    nav.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.innerHTML = open
      ? closeIcon
      : menuIcon;
  }

  toggle.addEventListener("click", function () {
    setOpen(nav.classList.contains("hidden"));
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  const toolbar = document.querySelector('[aria-label="Filtruj projekty według kategorii"]');
  const list = toolbar.parentElement.querySelector("ul");
  const live = toolbar.parentElement.querySelector("[aria-live='polite']");
  const items = Array.from(list.children);
  items.forEach(function (item) {
    const label = item.querySelector("span.text-faint");
    item.dataset.category = label ? label.textContent.trim() : "";
  });

  const pressedClass =
    "inline-flex min-h-11 items-center gap-2 rounded-pill bg-cyan px-4 text-sm font-medium text-bg";
  const idleClass =
    "inline-flex min-h-11 items-center gap-2 rounded-pill border border-line px-4 text-sm text-muted transition hover:border-cyan hover:text-fg";

  function countLabel(count) {
    if (count === 1) return "1 praca";
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return count + " prace";
    return count + " prac";
  }

  function chipName(button) {
    return Array.from(button.childNodes)
      .filter(function (node) {
        return node.nodeType === Node.TEXT_NODE;
      })
      .map(function (node) {
        return node.textContent.trim();
      })
      .join("");
  }

  toolbar.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button || !toolbar.contains(button)) return;
    const name = chipName(button);
    toolbar.querySelectorAll("button").forEach(function (chip) {
      const on = chip === button;
      chip.setAttribute("aria-pressed", on ? "true" : "false");
      chip.className = on ? pressedClass : idleClass;
      const count = chip.querySelector("span");
      if (count) count.className = on ? "tabular-nums text-bg/70" : "tabular-nums text-faint";
    });
    let shown = 0;
    items.forEach(function (item) {
      const match = name === "Wszystkie" || item.dataset.category === name;
      item.hidden = !match;
      if (match) shown += 1;
    });
    live.textContent = countLabel(shown) + (name === "Wszystkie" ? "" : " · " + name);
  });

  const topics = {
    wspolpraca: "Współpraca",
    projekt: "Nowy projekt",
    pytanie: "Pytanie",
  };
  const slot = document.querySelector("#kontakt .lg\\:col-span-7");
  const form = slot.querySelector("form");
  const fresh = form.cloneNode(true);

  function fieldError(input, message) {
    const label = input.closest("label");
    const old = label.querySelector(".text-violet");
    if (old) old.remove();
    input.removeAttribute("aria-invalid");
    if (!message) return;
    input.setAttribute("aria-invalid", "true");
    const span = document.createElement("span");
    span.className = "text-violet";
    span.textContent = message;
    label.appendChild(span);
  }

  function bindForm(current) {
    current.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = current.querySelector('[autocomplete="name"]');
      const email = current.querySelector('[type="email"]');
      const topic = current.querySelector("select");
      const message = current.querySelector("textarea");
      const nameValue = name.value.trim();
      const emailValue = email.value.trim();
      const messageValue = message.value.trim();
      let ok = true;
      if (nameValue.length < 2) {
        fieldError(name, "Podaj imię — przynajmniej dwie litery.");
        ok = false;
      } else fieldError(name, "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        fieldError(email, "Ten adres wygląda niekompletnie.");
        ok = false;
      } else fieldError(email, "");
      if (messageValue.length < 20) {
        fieldError(message, "Kilka zdań wystarczy, żeby zacząć.");
        ok = false;
      } else fieldError(message, "");
      if (!ok) return;

      const letter =
        "Od: " +
        nameValue +
        " <" +
        emailValue +
        ">\nTemat: " +
        (topics[topic.value] || topic.value) +
        "\n\n" +
        messageValue;
      const first = nameValue.split(" ")[0];
      slot.replaceChildren();
      const panel = document.createElement("div");
      panel.className = "rounded-card border border-line bg-surface p-6 md:p-8";
      panel.setAttribute("role", "status");
      const title = document.createElement("p");
      title.className = "font-display text-3xl";
      title.textContent = "Dziękuję, " + first + ".";
      const note = document.createElement("p");
      note.className = "mt-3 text-muted";
      note.textContent =
        "Wiadomość jest ułożona. Skopiuj ją i wyślij swoją drogą — formularz zostaje w przeglądarce i sam nic nie wysyła.";
      const pre = document.createElement("pre");
      pre.className =
        "mt-6 overflow-x-auto rounded-xl border border-line bg-bg p-4 text-sm leading-relaxed whitespace-pre-wrap text-fg";
      pre.textContent = letter;
      const actions = document.createElement("div");
      actions.className = "mt-6 flex flex-col gap-3 sm:flex-row";
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className =
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-cyan px-6 font-medium text-bg";
      copy.textContent = "Kopiuj wiadomość";
      const again = document.createElement("button");
      again.type = "button";
      again.className =
        "inline-flex min-h-12 items-center justify-center rounded-pill border border-line px-6";
      again.textContent = "Napisz kolejną";
      actions.append(copy, again);
      panel.append(title, note, pre, actions);
      slot.append(panel);
      copy.addEventListener("click", async function () {
        try {
          await navigator.clipboard.writeText(letter);
          copy.textContent = "Skopiowane";
        } catch {
          copy.textContent = "Zaznacz tekst i skopiuj";
        }
      });
      again.addEventListener("click", function () {
        slot.replaceChildren();
        const next = fresh.cloneNode(true);
        slot.appendChild(next);
        bindForm(next);
      });
    });
  }

  bindForm(form);
})();
