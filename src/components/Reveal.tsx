'use client';
import {useEffect} from 'react';
// Scroll-reveal for the static profile page. Content stays visible without JS or with reduced motion.
const SELECTOR='.lp-section-no,.lp-display,.lp-prose,.lp-fine,.lp-occupations li,.lp-steps li,.lp-path-grid article,.lp-refusals li,.lp-quote,.lp-audience article,.lp-faq details,.lp-close-mark,.lp-close p,.lp-close .button';
export default function Reveal(){
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  const items=[...document.querySelectorAll<HTMLElement>(SELECTOR)].filter(el=>!el.closest('.lp-hero'));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.15,rootMargin:'0px 0px -6% 0px'});
  items.forEach(el=>{
   el.classList.add('rv-item');
   el.style.setProperty('--d',Math.min([...(el.parentElement?.children??[])].indexOf(el),6)*80+'ms');
   io.observe(el);
  });
  document.documentElement.classList.add('rv');
  return()=>{io.disconnect();document.documentElement.classList.remove('rv');items.forEach(el=>el.classList.remove('rv-item','in'));};
 },[]);
 return null;
}
