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
    const doc='<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><base href="'+base.href+'"><link rel="stylesheet" href="libreta.css?v=integrado-13"><style>html,body{margin:0;padding:0;background:white}.report-sheet{zoom:1!important}.report-sheet>.kw-libreta-page{margin:0;box-shadow:none}</style></head><body></body></html>';
    frame.srcdoc=doc;document.body.append(frame);await ready;
    return frame;
  }
  async function makePdf(frame, item) {
    const doc=frame.contentDocument;
    doc.body.innerHTML=item.html;
    // Evitar cortes de palabras incompatibles con el renderizador del PDF.
    const wrapping=doc.createElement('style');
    wrapping.textContent='.report-sheet *{hyphens:none!important}';doc.body.append(wrapping);
    await Promise.all([...doc.images].map(img=>img.decode().catch(()=>{throw new Error('No se pudo cargar una imagen de la libreta.');})));
    await doc.fonts.ready;
    const pages=[...doc.querySelectorAll('.kw-libreta-page')];
    if(!pages.length)throw new Error('La libreta no contiene páginas.');
    const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
    pdf.setProperties({title:'Libreta - '+item.name,subject:'Informe de progreso académico',creator:'Sistema Académico Karol Wojtyla'});
    for(let index=0;index<pages.length;index++) {
      const canvas=await window.html2canvas(pages[index],{scale:3,backgroundColor:'#ffffff',logging:false,useCORS:true,windowWidth:900,windowHeight:1300,
        onclone(cloneDoc){
          // html2canvas no implementa object-fit: conservar la proporción del logo.
          cloneDoc.querySelectorAll('.report-insignia img').forEach(img=>{
            const r=img.getBoundingClientRect(),ratio=img.naturalWidth/img.naturalHeight;
            if(ratio){const width=Math.min(r.width,r.height*ratio);img.style.width=width+'px';img.style.height=(width/ratio)+'px';img.style.flex='none';img.parentElement.style.height='20mm';}
          });
        }
      });
      if(index)pdf.addPage();
      // Mantener proporciones; una hoja excepcionalmente larga se reduce para no cortar contenido.
      const width=Math.min(198,285*canvas.width/canvas.height),height=width*canvas.height/canvas.width;
      pdf.addImage(canvas,'PNG',(210-width)/2,6,width,height,undefined,'FAST');
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
