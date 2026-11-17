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
    const doc='<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><base href="'+base.href+'"><link rel="stylesheet" href="libreta.css?v=integrado-14"><style>'+`
      html,body{margin:0!important;padding:0!important;background:white;overflow:visible}
      .report-sheet{zoom:1!important;margin:0!important;width:210mm!important}
      .report-sheet>.kw-libreta-page{margin:0!important;box-shadow:none;width:210mm!important;height:297mm!important;min-height:297mm!important;padding:6mm!important;overflow:visible}
      .kw-pdf-content{display:flow-root;transform-origin:top left;width:100%}
      .kw-pdf-content>.official-nla-note{margin:1.5mm 1mm 0}
      .report-sheet .official-page-footer{left:6mm!important;right:6mm!important;bottom:9mm!important}
      .report-sheet *{hyphens:none!important}
    `+'</style></head><body></body></html>';
    frame.srcdoc=doc;document.body.append(frame);await ready;
    return frame;
  }
  async function makePdf(frame, item) {
    const doc=frame.contentDocument;
    doc.body.innerHTML=item.html;
    const pages=[...doc.querySelectorAll('.kw-libreta-page')].map(page=>page.outerHTML);
    if(!pages.length)throw new Error('La libreta no contiene páginas.');
    const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    pdf.setProperties({title:'Libreta - '+item.name,subject:'Informe de progreso académico',creator:'Sistema Académico Karol Wojtyla'});
    for(let index=0;index<pages.length;index++) {
      // Una sola hoja en el origen: nunca capturar una segunda hoja desplazada
      // fuera de la ventana ni depender del scroll/zoom del panel principal.
      doc.body.innerHTML='<div class="report-sheet">'+pages[index]+'</div>';
      const page=doc.querySelector('.kw-libreta-page');
      const footer=page.querySelector('.official-page-footer');
      if(!footer&&!page.classList.contains('report-summary-page'))throw new Error('Falta el pie de la libreta.');
      footer?.remove();
      const content=doc.createElement('div');content.className='kw-pdf-content';
      [...page.childNodes].forEach(node=>content.append(node));
      page.append(content);
      if(footer)page.append(footer);
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
      const bounds=content.getBoundingClientRect();
      const pageBounds=page.getBoundingClientRect();
      const contentBottom=footer?footer.getBoundingClientRect().top:pageBounds.bottom-pageBounds.height*35/297;
      const available=contentBottom-bounds.top-8;
      const naturalHeight=Math.max(bounds.height,content.scrollHeight);
      const factor=Math.min(1,available/naturalHeight);
      if(!Number.isFinite(factor)||factor<=0)throw new Error('No se pudo distribuir el contenido en la hoja.');
      // Ajustar únicamente cuando no cabe; no estirar cuadros ni desplazar la firma.
      content.style.transform='translateX('+((bounds.width*(1-factor))/2)+'px) scale('+factor+')';
      const size=page.getBoundingClientRect();
      const canvas=await window.html2canvas(page,{
        scale:3,backgroundColor:'#ffffff',logging:false,useCORS:true,
        foreignObjectRendering:true,
        scrollX:0,scrollY:0,x:0,y:0,
        width:Math.ceil(size.width),height:Math.ceil(size.height),
        windowWidth:900,windowHeight:Math.max(1300,Math.ceil(size.height))
      });
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
        await Promise.all([load('html2canvas.min.js'),load('jspdf.min.js'),...(mode==='zip'?[load('jszip.min.js')]:[])]);
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
