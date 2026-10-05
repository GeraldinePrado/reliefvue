/** Short, illustrative traces run on entry. Values and actions never depend on playback. */
export function initJourneyMotion(root:HTMLElement):()=>void {
 const rail=root.querySelector<HTMLElement>('.timeline-rail');const bridge=root.querySelector<HTMLElement>('.flow-bridge');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let animation:Animation|undefined;let resize:ResizeObserver|undefined;let svg:SVGSVGElement|undefined;let light:SVGPathElement|undefined;
 const ns='http://www.w3.org/2000/svg';
 function draw(){if(!rail||!svg||!light)return;animation?.cancel();svg.setAttribute("width","0");svg.setAttribute("height","0");const rect=rail.getBoundingClientRect();const points=[...rail.querySelectorAll<HTMLElement>('.timeline-step>span')].map(el=>{const b=el.getBoundingClientRect();return {x:b.x-rect.x+rail.scrollLeft+b.width/2,y:b.y-rect.y+rail.scrollTop+b.height/2};});if(points.length!==4)return;
 const mobile=matchMedia('(max-width:700px)').matches;let d=`M ${points[0].x} ${points[0].y}`;
 points.slice(1).forEach((p,i)=>{const prev=points[i];if(!mobile){d+=` L ${p.x} ${p.y}`;return;}const turn=p.y-25;const direction=p.x>prev.x?1:-1;d+=` V ${turn-18} Q ${prev.x} ${turn} ${prev.x+direction*18} ${turn} H ${p.x} V ${p.y}`;});
 svg.setAttribute('width',String(rail.scrollWidth));svg.setAttribute('height',String(rail.scrollHeight));svg.querySelectorAll('path').forEach(p=>p.setAttribute('d',d));light.style.opacity='0';
 }
 function trace(){if(!light||reduced.matches)return;animation?.cancel();const length=light.getTotalLength();light.style.strokeDasharray=`60 ${length}`;animation=light.animate([{strokeDashoffset:'60',opacity:0},{strokeDashoffset:'0',opacity:1,offset:.08},{strokeDashoffset:String(-length),opacity:0}],{duration:4500,easing:'linear'});}
 if(rail){svg=document.createElementNS(ns,'svg');svg.classList.add('journey-track');svg.setAttribute('aria-hidden','true');for(const kind of ['journey-base','journey-light']){const path=document.createElementNS(ns,'path');path.classList.add(kind);svg.append(path);if(kind==='journey-light')light=path;}rail.append(svg);rail.classList.add('has-journey-track');resize=new ResizeObserver(draw);resize.observe(rail);draw();}
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.target===rail){if(entry.isIntersecting)trace();else animation?.cancel();}else if(entry.target===bridge){bridge!.classList.toggle('is-tracing',entry.isIntersecting&&!reduced.matches);}}),{threshold:.2});
 if(rail)observer.observe(rail);if(bridge)observer.observe(bridge);
 const preference=()=>{if(reduced.matches){animation?.cancel();bridge?.classList.remove('is-tracing');}};reduced.addEventListener('change',preference);
 return ()=>{observer.disconnect();resize?.disconnect();animation?.cancel();reduced.removeEventListener('change',preference);};
}
