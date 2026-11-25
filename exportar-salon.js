/* Exportación local por salón. No consulta ni modifica el backend. */
(() => {
  const base = new URL('.', document.currentScript.src);
  let opened = false;
  const loads = new Map();
  function load(file) {
    if (!loads.has(file)) loads.set(file, new Promise((resolve,reject) => {
      const s=document.createElement('script'); s.src=new URL('vendor/'+file,base);
      s.onload=resolve; s.onerror=()=>{s.remove();loads.delete(file);reject(new Error('No se pudo cargar '+file+'. Incluye la carpeta vendor completa.'));};
      document.head.append(s);
    }));
    return loads.get(file);
  }
  const safe = value => String(value||'Sin nombre').normalize('NFC').replace(/[<>:"/\\|?*\x00-\x1F]/g,'_').replace(/[. ]+$/g,'').slice(0,100) || 'Sin nombre';
  function download(blob,name) {
    const url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  async function createFrame() {
    const frame=document.createElement('iframe');
    frame.title='Preparación de PDF';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
    frame.style.cssText='position:fixed;left:-10000px;top:0;width:900px;height:1300px;border:0;pointer-events:none';
    const ready=new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=()=>reject(new Error('No se pudo preparar el documento.'));});
    const doc='<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><base href="'+base.href+'"><link rel="stylesheet" href="libreta.css?v=integrado-15"><script src="libreta-paginas.js?v=integrado-15"></script><style>html,body{margin:0;padding:0;background:white}.report-sheet.kw-paginated{margin:0}.report-sheet.kw-paginated>.kw-libreta-page{margin:0;box-shadow:none}</style></head><body></body></html>';
    frame.srcdoc=doc;document.body.append(frame);await ready;
    return frame;
  }
  async function makePdf(frame, item) {
    const doc=frame.contentDocument;
    doc.body.innerHTML=item.html;
    await frame.contentWindow.KWReportPages.paginate(doc.querySelector('.report-sheet'));
    const pages=[...doc.querySelectorAll('.kw-libreta-page')].map(page=>page.outerHTML);
    if(!pages.length)throw new Error('La libreta no contiene páginas.');
    const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    pdf.setProperties({title:'Libreta - '+item.name,subject:'Informe de progreso académico',creator:'Sistema Académico Karol Wojtyla'});
    for(let index=0;index<pages.length;index++) {
      // Una sola hoja en el origen: nunca capturar una segunda hoja desplazada
      // fuera de la ventana ni depender del scroll/zoom del panel principal.
      doc.body.innerHTML='<div class="report-sheet kw-paginated">'+pages[index]+'</div>';
      const page=doc.querySelector('.kw-libreta-page');
      await Promise.all([...doc.images].map(async img=>{
        try{
          await img.decode();
          // SVG no permite recursos externos: incluir el logo dentro de la captura.
          const asset=doc.createElement('canvas');asset.width=img.naturalWidth;asset.height=img.naturalHeight;
          asset.getContext('2d').drawImage(img,0,0);img.src=asset.toDataURL('image/png');
          asset.width=asset.height=1;await img.decode();
        }catch(e){throw new Error('No se pudo cargar una imagen de la libreta.');}
      }));
      await doc.fonts.ready;
      const size=page.getBoundingClientRect();
      // Documento SVG autocontenido: no hereda el scroll ni recortes de iframes.
      const width=Math.ceil(size.width),height=Math.ceil(size.height);
      const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('width',width);svg.setAttribute('height',height);
      const foreign=doc.createElementNS('http://www.w3.org/2000/svg','foreignObject');
      foreign.setAttribute('width','100%');foreign.setAttribute('height','100%');
      const root=doc.createElement('div'),style=doc.createElement('style');
      style.textContent=[...doc.styleSheets].flatMap(sheet=>[...sheet.cssRules].map(rule=>rule.cssText)).join('\n')+
        '\n.report-sheet.kw-paginated{margin:0!important}.report-sheet.kw-paginated>.kw-libreta-page{margin:0!important;box-shadow:none}';
      root.append(style,page.parentElement.cloneNode(true));foreign.append(root);svg.append(foreign);
      const picture=new frame.contentWindow.Image();
      picture.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));
      await picture.decode();
      const canvas=doc.createElement('canvas');canvas.width=width*3;canvas.height=height*3;
      const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
      context.drawImage(picture,0,0,canvas.width,canvas.height);
      if(index)pdf.addPage();
      pdf.addImage(canvas,'PNG',0,0,210,297,undefined,'FAST');
      canvas.width=canvas.height=1;
    }
    return pdf.output('blob');
  }
  window.KWReportBatch={open({grade,bimestre,items}) {
    if(opened||!items.length)return;
    opened=true;
    const modal=document.createElement('dialog');modal.className='kw-batch-dialog';
    modal.innerHTML='<h2>Descargar libretas del salón</h2><p data-summary></p><p>Se generará un PDF independiente por alumno, con todas las páginas de su libreta.</p><div class="kw-batch-actions"><button data-folder>Elegir carpeta y guardar</button><button data-zip>Descargar ZIP</button></div><p data-progress role="status" aria-live="polite"></p><progress max="'+items.length+'" value="0" hidden></progress><ul data-errors></ul><button data-close>Cerrar</button>';
    const q=s=>modal.querySelector(s),msg=q('[data-progress]');q('[data-summary]').textContent=grade+' · '+bimestre+' · '+items.length+' alumnos';
    const folderButton=q('[data-folder]'),zipButton=q('[data-zip]'),close=q('[data-close]'),progress=q('progress');
    folderButton.hidden=!(window.isSecureContext&&typeof window.showDirectoryPicker==='function');
    if(folderButton.hidden)msg.textContent='Este navegador permite descargar un ZIP. Al extraerlo tendrás la carpeta con todos los PDF.';
    let busy=false,cancelled=false;
    const finish=()=>{modal.remove();opened=false;};
    close.onclick=()=>{if(busy){cancelled=true;close.disabled=true;msg.textContent='Deteniendo al terminar la libreta actual…';}else finish();};
    modal.addEventListener('cancel',e=>{if(busy){e.preventDefault();close.click();}});
    modal.addEventListener('close',()=>{if(!busy)finish();});
    async function run(mode){
      if(busy)return;busy=true;cancelled=false;folderButton.disabled=zipButton.disabled=true;close.textContent='Detener';q('[data-errors]').replaceChildren();progress.value=0;progress.hidden=false;
      let frame,dir,zip,count=0;const errors=[];
      const stamp=new Date().toISOString().replace(/[:.]/g,'-');
      const folderName=safe('Libretas_'+grade+'_'+bimestre)+'_'+stamp;
      try{
        if(mode==='folder'){
          // El selector se abre directamente dentro del clic, antes de esperar otras tareas.
          const root=await window.showDirectoryPicker({id:'kw-libretas',mode:'readwrite',startIn:'downloads'});
          dir=await root.getDirectoryHandle(folderName,{create:true});
        }
        msg.textContent='Preparando la exportación…';
        await Promise.all([load('jspdf.min.js'),...(mode==='zip'?[load('jszip.min.js')]:[])]);
        if(mode==='zip')zip=new window.JSZip();
        frame=await createFrame();
        for(let i=0;i<items.length&&!cancelled;i++){
          const item=items[i];msg.textContent='Generando '+(i+1)+' de '+items.length+': '+item.name;
          try{
            const blob=await makePdf(frame,item);
            const name=String(i+1).padStart(3,'0')+'_'+safe(item.name)+'_'+safe(bimestre)+'.pdf';
            if(dir){const file=await dir.getFileHandle(name,{create:true});const writer=await file.createWritable();try{await writer.write(blob);await writer.close();}catch(e){await writer.abort().catch(()=>{});throw e;}}
            else zip.folder(folderName).file(name,await blob.arrayBuffer());
            count++;
          }catch(e){errors.push(item.name+': '+e.message);}
          progress.value=i+1;
          await new Promise(resolve=>setTimeout(resolve,0));
        }
        if(zip&&count){msg.textContent='Preparando ZIP con '+count+' PDF…';download(await zip.generateAsync({type:'blob',compression:'STORE'}),folderName+'.zip');}
        msg.textContent=(cancelled?'Exportación detenida. ':'')+count+' de '+items.length+' PDF '+(dir?'guardados en '+folderName:'incluidos en el ZIP')+'.'+(errors.length?' '+errors.length+' libretas no se pudieron generar.':'');
        errors.forEach(error=>{const li=document.createElement('li');li.textContent=error;q('[data-errors]').append(li);});
      }catch(e){msg.textContent=e.name==='AbortError'?'Selección de carpeta cancelada.':'No se completó la exportación: '+e.message;}
      finally{frame?.remove();busy=false;folderButton.disabled=zipButton.disabled=false;close.disabled=false;close.textContent='Cerrar';}
    }
    folderButton.onclick=()=>run('folder');zipButton.onclick=()=>run('zip');
    document.body.append(modal);modal.showModal();
  }};
})();
