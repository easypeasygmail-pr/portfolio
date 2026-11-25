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
  let items = Array.from(list.children);
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

  document.addEventListener("voklaris:projects", function () {
    items = Array.from(list.children);
    toolbar.querySelectorAll("button").forEach(function (chip) {
      const name = chipName(chip);
      chip.querySelector("span").textContent = name === "Wszystkie" ? items.length : items.filter(i => i.dataset.category === name).length;
    });
    (toolbar.querySelector('[aria-pressed="true"]') || toolbar.querySelector("button")).click();
  });

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

/* Lokalny edytor szablonu. Nie wysyła danych na serwer. */
(function () {
  'use strict';
  const key = 'voklaris-editor-v1';
  const projectList = document.querySelector('#projekty ul');
  const categories = ['Systemy', 'Czat', 'Mobile', 'Narzędzia', 'Logistyka'];
  const originalProjects = projectList.innerHTML;
  const projectTemplate = projectList.firstElementChild.cloneNode(true);
  const originals = {};
  const fields = new Map();
  let active = false, selected = null, nextId = 0, extra = 0;
  let sourceHTML = null;
  const originalImages = Array.from(document.images).map(img => ({src:img.getAttribute('src'),alt:img.alt}));
  const images = Array.from(document.images);
  const assetPaths = ["README.md", "index.html", "site.js", "fonts.css", "favicon.svg", "styles.css", "fonts/6NU58FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChjeveQ.woff2", "fonts/6NU58FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChjdPeQ_5Y.woff2", "fonts/6NU78FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0KxCFTeO-U.woff2", "fonts/6NU78FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0KxC9TeA.woff2", "fonts/QGYvz_MVcBeNP4NJuktqQ4E.woff2", "fonts/QGYvz_MVcBeNP4NJtEtq.woff2", "fonts/6NU58FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChjdfeQ_5Y.woff2", "fonts/6NU78FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0KxCBTeO-U.woff2", "media/voklaris-logo.jpg", "media/voklaris-logo.png", "media/portrait.jpg"];
  // Identyfikatory pozostają stałe między wizytami i eksportami.
  function scan(root, prefix) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.textContent.trim() || n.parentElement.closest('script,style,svg,option,button,input,textarea,[aria-live],#v-editor,#v-edit-button,[data-v-field]')) continue;
      nodes.push(n);
    }
    nodes.forEach((n,i) => {
      const span = document.createElement('span');
      const id = prefix ? prefix + '-' + i : 'text-' + nextId++;
      span.dataset.vField = id; span.textContent = n.textContent;
      n.replaceWith(span); originals[id] = span.textContent;
    });
    rebuildFields();
  }
  function rebuildFields() {
    fields.clear(); document.querySelectorAll('[data-v-field]').forEach(el => fields.set(el.dataset.vField,el));
  }
  scan(document.body);
  function notifyProjects() { document.dispatchEvent(new Event('voklaris:projects')); }
  function state() {
    const texts = {};
    fields.forEach((el,id) => {if (!projectList.contains(el)) texts[id] = el.textContent;});
    return {texts, extra, projects:Array.from(projectList.children).map(el => ({category:el.dataset.category,values:Array.from(el.querySelectorAll('[data-v-field]')).map(n=>n.textContent)})),images:images.map(img=>({src:img.getAttribute('src'),alt:img.alt}))};
  }
  function apply(s) {
    if (!s || typeof s !== 'object') return;
    if (s.texts) Object.entries(s.texts).forEach(([id,value])=>{if(fields.has(id) && typeof value==='string')fields.get(id).textContent=value;});
    if (Array.isArray(s.projects)) {
      projectList.replaceChildren();
      s.projects.forEach((p,i)=> {
        if (!categories.includes(p.category) || !Array.isArray(p.values)) return;
        const el = projectTemplate.cloneNode(true);
        el.dataset.category=p.category; el.hidden=false;
        scan(el,'project-'+i);
        el.querySelectorAll('[data-v-field]').forEach((n,j)=>{if(typeof p.values[j]==='string')n.textContent=p.values[j];});
        projectList.append(el);
      });
      rebuildFields(); notifyProjects();
    }
    if (Array.isArray(s.images)) s.images.forEach((value,i)=>{
      if (!images[i] || typeof value.src!=='string') return;
      if (/^(media\/|favicon\.svg$|data:image\/(png|jpeg|webp|gif);base64,)/.test(value.src)) images[i].setAttribute('src',value.src);
      if (typeof value.alt==='string') images[i].alt=value.alt;
    });
    extra = Number(s.extra)||0;
  }
  const embedded=document.getElementById('v-content');
  try {apply(embedded ? JSON.parse(embedded.textContent) : JSON.parse(localStorage.getItem(key)||'null'));} catch {}
  const button=document.createElement('button'); button.id='v-edit-button';button.type='button';button.textContent='Edytuj';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','v-editor');
  const panel=document.createElement('aside');panel.id='v-editor';panel.hidden=true;panel.setAttribute('aria-label','Edytor szablonu');
  document.body.append(button,panel);
  function node(tag,text,parent=panel) {const n=document.createElement(tag);if(text!==undefined)n.textContent=text;parent.append(n);return n;}
  function action(label,fn,parent=panel) {const b=node('button',label,parent);b.type='button';b.addEventListener('click',fn);return b;}
  function status(text) {const s=panel.querySelector('[role=status]');if(s)s.textContent=text;}
  function save() {try {localStorage.setItem(key,JSON.stringify(state()));status('Zapisano w tej przeglądarce.');} catch {status('Brak miejsca w przeglądarce. Pobierz ZIP, aby zachować zmiany.');}}
  function base(title) {
    panel.hidden=false;panel.replaceChildren();const top=node('div',undefined);top.className='v-top';node('h2',title,top);action('Zamknij',()=>setActive(false),top);
    const a=node('div');a.className='v-actions';action('Podgląd strony',()=>{panel.hidden=true;},a);action('Wszystkie elementy',all,a);action('Zdjęcie i logo',pictures,a);action('Projekty',projects,a);
    const note=node('p','Zmiany są lokalne. Pobierz ZIP i przekaż go do publikacji. Publiczna strona zmieni się dopiero po wgraniu plików.');
    const s=node('p','',panel);s.setAttribute('role','status');
    const exportButton=action('Pobierz kompletny ZIP',download);exportButton.className='v-primary';
  }
  function setActive(on) {active=on;panel.hidden=!on;document.body.classList.toggle('v-editing',on);button.setAttribute('aria-expanded',String(on));button.textContent=on?'Zakończ edycję':'Edytuj';if(on){all();panel.querySelector('button').focus();}else button.focus();}
  button.addEventListener('click',()=>{if(active&&panel.hidden){panel.hidden=false;all();}else setActive(!active);});
  function labelOf(el) {const sec=el.closest('section');return (sec?({start:'Start','o-mnie':'O mnie',projekty:'Projekty',umiejetnosci:'Umiejętności',kontakt:'Kontakt'}[sec.id]||sec.id):el.closest('footer')?'Stopka':'Pasek')+' · '+el.textContent.trim().slice(0,75);}
  function edit(el) {
    selected=el; base('Edytuj tekst');
    const l=node('label',labelOf(el));const input=node('textarea',el.textContent,l);input.value=el.textContent;
    input.addEventListener('input',()=>{el.textContent=input.value;save();});
    action('Przywróć pierwotny tekst',()=>{el.textContent=originals[el.dataset.vField]??el.textContent;input.value=el.textContent;save();});
    const p=el.closest('#projekty li');if(p)action('Kategoria i usunięcie projektu',()=>projectEdit(p));
    input.focus();
  }
  function all() {
    base('Wszystkie elementy');node('p','Kliknij tekst na stronie albo wybierz go poniżej. Podgląd zmienia się od razu.');
    const search=node('input');search.type='search';search.placeholder='Szukaj tekstu';search.setAttribute('aria-label','Szukaj pola');search.className='v-search';
    const list=node('div');
    function render() {list.replaceChildren();fields.forEach(el=>{if(!el.isConnected || !labelOf(el).toLowerCase().includes(search.value.toLowerCase()))return;const b=action(labelOf(el),()=>edit(el),list);b.className='v-field';});}
    search.addEventListener('input',render);render();
    action('Przywróć wszystkie pierwotne teksty',()=>{fields.forEach((el,id)=>{if(id in originals)el.textContent=originals[id];});save();all();});
  }
  document.addEventListener('click',event=>{
    if (!active || panel.contains(event.target) || button.contains(event.target))return;
    const img=event.target.closest('img');const el=event.target.closest('[data-v-field]');
    if(img){event.preventDefault();event.stopImmediatePropagation();pictures();}else if(el){event.preventDefault();event.stopImmediatePropagation();edit(el);}
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active)setActive(false);});
  function pictures() {
    base('Zdjęcie i logo');
    const groups=[{name:'Zdjęcie osoby',members:images.filter(i=>originalImages[images.indexOf(i)].src==='media/portrait.jpg')},{name:'Logo',members:images.filter(i=>/voklaris-logo/.test(originalImages[images.indexOf(i)].src))}];
    groups.forEach(g=>{
      node('h3',g.name);const l=node('label','Wybierz plik PNG, JPG lub WebP');const input=node('input',undefined,l);input.type='file';input.accept='image/png,image/jpeg,image/webp';
      input.addEventListener('change',async()=>{const f=input.files[0];if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>8*1024*1024){status('Wybierz obraz PNG, JPG lub WebP do 8 MB.');return;}
        const reader=new FileReader();reader.onload=()=>{g.members.forEach(i=>i.src=reader.result);save();};reader.onerror=()=>status('Nie udało się odczytać obrazu.');reader.readAsDataURL(f);
      });
      const al=node('label','Opis obrazu');const text=node('input',undefined,al);text.value=g.members[0].alt;text.addEventListener('input',()=>{g.members.forEach(i=>i.alt=text.value);save();});
      action('Przywróć '+g.name.toLowerCase(),()=>{g.members.forEach(i=>{const o=originalImages[images.indexOf(i)];i.src=o.src;i.alt=o.alt;});save();pictures();});
    });
  }
  function projects() {
    base('Projekty');Array.from(projectList.children).forEach(p=>{const b=action(p.querySelector('h3').textContent,()=>projectEdit(p));b.className='v-field';});
    action('Dodaj projekt',()=>newProject());
  }
  function projectEdit(p) {
    base('Edytuj projekt');p.querySelectorAll('[data-v-field]').forEach(el=>{action(el.textContent.slice(0,90),()=>edit(el)).className='v-field';});
    const l=node('label','Kategoria');const select=node('select',undefined,l);categories.forEach(c=>{const o=node('option',c,select);o.value=c;});select.value=p.dataset.category;
    select.addEventListener('change',()=>{p.dataset.category=select.value;const tag=p.querySelector('span.text-faint');const inner=tag.querySelector('[data-v-field]');(inner||tag).textContent=select.value;notifyProjects();save();});
    action('Usuń ten projekt',()=>{p.remove();rebuildFields();notifyProjects();save();projects();});
  }
  function newProject() {
    base('Nowy projekt');
    const controls={};[['name','Nazwa'],['line','Jedna linia'],['description','Opis — dwa zdania']].forEach(([id,label])=>{const l=node('label',label);controls[id]=node(id==='description'?'textarea':'input',undefined,l);});
    const l=node('label','Kategoria');const category=node('select',undefined,l);categories.forEach(c=>{const o=node('option',c,category);o.value=c;});
    action('Dodaj',()=>{
      const name=controls.name.value.trim(),line=controls.line.value.trim(),desc=controls.description.value.trim();if(!name||!line||!desc){status('Uzupełnij nazwę, linię i opis.');return;}
      const p=projectTemplate.cloneNode(true);p.hidden=false;p.dataset.category=category.value;
      const nums=Array.from(projectList.children).map(el=>parseInt(el.querySelector('span.text-cyan').textContent)||0);const number=Math.max(0,...nums)+1;
      p.querySelector('span.text-cyan').textContent=String(number).padStart(2,'0');p.querySelector('span.text-faint').textContent=category.value;p.querySelector('h3').textContent=name;
      const ps=p.querySelectorAll('p');ps[0].textContent=line;ps[1].textContent=desc;
      projectList.append(p);scan(p,'new-'+(++extra));notifyProjects();save();projects();
    }).className='v-primary';
  }
  // ZIP bez bibliotek i usług zewnętrznych, z pełnym zestawem zasobów.
  function zip(entries) {
    const enc=new TextEncoder(), chunks=[], central=[];let offset=0;
    const crc=bytes=>{let c=0xffffffff;for(const b of bytes){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
    for(const [path,bytes] of entries){const name=enc.encode(path),sum=crc(bytes);const local=new Uint8Array(30+name.length);const v=new DataView(local.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,sum,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);local.set(name,30);chunks.push(local,bytes);
      const dir=new Uint8Array(46+name.length),d=new DataView(dir.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint32(16,sum,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);dir.set(name,46);central.push(dir);offset+=local.length+bytes.length;
    }
    const length=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,entries.length,true);e.setUint16(10,entries.length,true);e.setUint32(12,length,true);e.setUint32(16,offset,true);return new Blob([...chunks,...central,end],{type:'application/zip'});
  }
  async function download() {
    status('Przygotowuję kompletny ZIP…');
    try {
      const entries=await Promise.all(assetPaths.map(async path=>{const r=await fetch(path + "?v=editor2", {cache:"no-store"});if(!r.ok)throw Error(path);return[path,new Uint8Array(await r.arrayBuffer())];}));
      const enc=new TextEncoder();let html=new TextDecoder().decode(entries.find(e=>e[0]==='index.html')[1]);
      html=html.replace(/<script id="v-content" type="application\/json">[\s\S]*?<\/script>/g,'');
      const content=JSON.stringify(state()).replace(/</g,'\\u003c');
      html=html.replace('<body>','<body><script id="v-content" type="application/json">'+content+'</script>');
      entries.find(e=>e[0]==='index.html')[1]=enc.encode(html);
      const blob=zip(entries),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='voklaris.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);status('ZIP gotowy. Zawiera całą stronę i Twoje zmiany.');
    } catch {status('Nie udało się pobrać zasobów. Otwórz edytor na opublikowanej stronie i spróbuj ponownie.');}
  }
})();
