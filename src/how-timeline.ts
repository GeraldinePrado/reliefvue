/** Overflow navigation for the explainer; native scrolling also supports touch and keyboard. */
export function initHowTimeline(root:HTMLElement):()=>void {
 const rail=root.querySelector<HTMLElement>('.how-timeline-scroll');if(!rail)return ()=>{};
 const previous=root.querySelector<HTMLButtonElement>('[data-how-prev]')!;
 const next=root.querySelector<HTMLButtonElement>('[data-how-next]')!;
 const controls=root.querySelector<HTMLElement>('.how-timeline-controls')!;
 const sync=()=>{const max=rail.scrollWidth-rail.clientWidth;controls.hidden=max<2;previous.disabled=rail.scrollLeft<2;next.disabled=rail.scrollLeft>=max-2;};
 const move=(direction:number)=>rail.scrollBy({left:direction*(rail.querySelector<HTMLElement>('article')!.offsetWidth+24),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 previous.onclick=()=>move(-1);next.onclick=()=>move(1);
 rail.addEventListener('scroll',sync,{passive:true});const observer=new ResizeObserver(sync);observer.observe(rail);sync();
 return ()=>{observer.disconnect();rail.removeEventListener('scroll',sync);};
}
