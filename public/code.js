"use strict";console.clear(),figma.showUI(__html__,{width:320,height:480,themeColors:!0});const e=figma.currentPage.findAllWithCriteria({types:["COMPONENT"]});let t=[];function i(e,t){return{x:0+64*t,y:0+80*e}}0!==e.length&&e.forEach((e=>{const i=e.getPluginData("importedIcon");if(!i)return;let s=JSON.parse(i);s.status="",t.push(s)})),0!==t.length?figma.ui.postMessage({type:"loaded-nodes",data:t}):figma.ui.postMessage({type:"loaded-nodes-empty"}),figma.ui.onmessage=e=>{if("create-library"===e.type){let s=0,a=0;const n=50;let o={added:[],updated:[]};e.doc.forEach(((e,d)=>{s=Math.floor(d/n),a=d%n;let g=e.hash;if(t.findIndex((e=>e.hash==g)),"added"===e.status){const t=e,n=figma.createNodeFromSvg(e.svg);n.name="svg";const d=figma.createComponent();d.resizeWithoutConstraints(n.width,n.height),d.appendChild(n),figma.ungroup(n);let g,r=i(s,a);d.x=r.x,d.y=r.y,g=32!==e.dimensions[0]||32!==e.dimensions[1]?e.name+"_"+e.dimensions[0]:e.name,d.name=g,t.id=d.id,d.setPluginData("importedIcon",JSON.stringify(t)),o.added.push(e)}else{let t=figma.getNodeById(e.id);if(t){let e=i(s,a);t.x=e.x,t.y=e.y}}if("changed"===e.status){let t=figma.getNodeById(e.id);const i=figma.createNodeFromSvg(e.svg);i.name="svg";const s=t.children;t.resizeWithoutConstraints(i.width,i.height),s.forEach((e=>{e.remove()}));const a=e;t.setPluginData("importedIcon",JSON.stringify(a)),t.appendChild(i),figma.ungroup(i)}if("deleted"===e.status){const t=e;figma.getNodeById(e.id).setPluginData("importedIcon",JSON.stringify(t))}}));for(const e in o)console.log(`${o[e].length} item(s) ${e}`);figma.ui.postMessage({type:"done-create-library"}),figma.notify("Successfully updated icon components")}};
