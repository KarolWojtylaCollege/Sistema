/* Distribución común para pantalla, impresión y descarga. No cambia datos. */
(() => {
  const clone = node => node.cloneNode(true);
  async function paginate(sheet) {
    if (!sheet || sheet.dataset.paginated === 'true') return;
    const doc = sheet.ownerDocument;
    await doc.fonts.ready;
    await Promise.all([...sheet.querySelectorAll('img')].map(img => img.decode().catch(() => {})));
    if (sheet.dataset.paginated === 'true') return;
    const source = clone(sheet);
    const heading = source.querySelector('.report-header');
    const student = source.querySelector('.report-head');
    const signature = source.querySelector('.official-page-footer');
    const academic = source.querySelector('.report-main');
    const summary = source.querySelector('.report-summary-page');
    if (!heading || !student || !signature || !academic || !summary) throw new Error('La libreta está incompleta.');
    sheet.replaceChildren();
    sheet.classList.add('kw-paginated');
    let page, body;
    function newPage(section) {
      page = doc.createElement('div');
      page.className = 'kw-libreta-page '+section;
      const head = doc.createElement('div'); head.className = 'kw-page-heading';
      head.append(clone(heading), clone(student));
      body = doc.createElement('div'); body.className = 'kw-page-content';
      const footer = clone(signature);
      if (sheet.children.length === 0) {
        footer.classList.add('official-footer-first');
        footer.querySelectorAll('.official-digital-text').forEach(n=>n.remove());
      }
      page.append(head, body, footer); sheet.append(page);
      const top = head.getBoundingClientRect().bottom-page.getBoundingClientRect().top;
      body.style.top = Math.ceil(top)+'px';
      if (body.clientHeight < 100) throw new Error('El encabezado no deja espacio suficiente para el contenido.');
    }
    function fits() {
      const bottom = body.getBoundingClientRect().bottom-2;
      return [...body.children].every(n => n.getBoundingClientRect().bottom <= bottom);
    }
    function tableShell(table) {
      const result = clone(table);
      [...result.tBodies].forEach(b => b.remove());
      result.append(doc.createElement('tbody'));
      return result;
    }
    function rowsOf(table) {
      let area;
      return [...table.tBodies].flatMap(b => [...b.rows]).map(original => {
        const row = clone(original), own = row.querySelector('.report-area');
        if (own) { area=clone(own); area.rowSpan=1; own.rowSpan=1; }
        else if (row.classList.contains('report-section-header')) area=null;
        else if (area) row.prepend(clone(area));
        return row;
      });
    }
    function renderRows(table, rows) {
      const tbody=table.tBodies[0]; tbody.replaceChildren(...rows.map(clone));
      let previous=null;
      [...tbody.rows].forEach(row => {
        const area=row.querySelector('.report-area');
        if (!area) { previous=null; return; }
        if (previous && previous.textContent===area.textContent) { previous.rowSpan++;area.remove(); }
        else previous=area;
      });
    }
    // Dividir una fila excepcionalmente larga por su texto, sin cortar letras
    // pintadas ni perder contenido; los identificadores y notas se repiten.
    function splitRow(row, accept) {
      const fields=[...row.querySelectorAll('.report-desc,.report-comp')];
      if (!fields.length && row.querySelector('td')) fields.push(row.querySelector('td:last-child'));
      const indices=fields.map(cell => [...row.cells].indexOf(cell));
      const values=fields.map(cell => Array.from(cell.textContent));
      const length=Math.max(0,...values.map(v=>v.length));
      function part(n) {
        const first=clone(row), rest=clone(row);
        values.forEach((chars,i) => {
          let cut=Math.floor(chars.length*n/length);
          if (cut<chars.length && cut>0) {
            const space=chars.slice(0,cut).join('').search(/\s+\S*$/u);
            if(space>0)cut=Array.from(chars.slice(0,cut).join('').slice(0,space+1)).length;
          }
          first.cells[indices[i]].textContent=chars.slice(0,cut).join('');
          rest.cells[indices[i]].textContent=chars.slice(cut).join('');
        });
        return [first,rest];
      }
      let lo=1,hi=length-1,best=0;
      while(lo<=hi){const mid=Math.floor((lo+hi)/2);if(accept(part(mid)[0])){best=mid;lo=mid+1;}else hi=mid-1;}
      if(!best)throw new Error('Una fila no cabe en la hoja; revise su contenido.');
      const result=part(best);
      if(indices.every(i=>!result[0].cells[i].textContent))throw new Error('No se pudo dividir una fila.');
      return result;
    }
    function addTable(sourceTable, section, tail) {
      let table=tableShell(sourceTable), placed=[];
      body.append(table);
      const queue=rowsOf(sourceTable);
      function paint(rows){renderRows(table,rows);return fits();}
      function advance(){newPage(section);table=tableShell(sourceTable);body.append(table);placed=[];}
      while(queue.length) {
        const row=queue.shift();
        if(paint([...placed,row])){placed.push(row);continue;}
        paint(placed);
        if(placed.length){
          // No dejar TALLERES solo al pie: pasa junto a la siguiente competencia.
          let sectionRow;
          if(placed.at(-1).classList.contains('report-section-header')){sectionRow=placed.pop();paint(placed);}
          if(!placed.length)table.remove();
          advance();if(sectionRow){placed.push(sectionRow);paint(placed);}
        } else if(body.children.length>1){table.remove();advance();}
        if(paint([...placed,row])){placed.push(row);continue;}
        const [first,rest]=splitRow(row,candidate=>paint([...placed,candidate]));
        placed.push(first);paint(placed);advance();queue.unshift(rest);
      }
      if(tail){
        const note=clone(tail);body.append(note);
        if(!fits()){
          note.remove();
          // Mantener la aclaración junto a la última fila, no en una hoja sola.
          const last=placed.pop();paint(placed);if(!placed.length)table.remove();
          advance();placed=[last];paint(placed);body.append(note);
          if(!fits())throw new Error('La última fila y la aclaración no caben juntas.');
        }
      }
    }
    function addBlock(block,section) {
      const copy=clone(block);body.append(copy);
      if(fits())return;
      copy.remove();
      if(body.children.length)newPage(section);
      if(block.matches('table')&&block.tBodies.length){addTable(block,section);return;}
      body.append(copy);
      if(!fits())throw new Error('Un bloque de la libreta supera el alto disponible.');
    }
    try {
      newPage('report-academic-page');
      addTable(academic,'report-academic-page',source.querySelector('.official-nla-note'));
      // La escala empieza como mínimo en la segunda hoja. Si la tabla
      // académica ya continúa allí, aprovechar el espacio que queda libre.
      if (sheet.children.length === 1) newPage('report-summary-page');
      [...summary.children].filter(n=>!n.matches('.official-page-footer,.report-header,.report-head')).forEach(n=>addBlock(n,'report-summary-page'));
      [...sheet.children].forEach((p,i)=>{p.dataset.page=String(i+1);});
      sheet.dataset.paginated='true';
    } catch(error) {
      sheet.classList.remove('kw-paginated');sheet.replaceChildren(...[...source.childNodes].map(clone));throw error;
    }
  }
  window.KWReportPages={paginate};
})();
