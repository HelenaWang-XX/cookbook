/** 工具函数 */
function uid(){return'xxxx-4xxx-xxxx'.replace(/x/g,()=>(Math.random()*16|0).toString(16))}
function fmtDate(ts){const d=new Date(ts);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function fmtDuration(m){if(!m)return'';if(m<60)return m+'分钟';return Math.floor(m/60)+'小时'+(m%60||'')+'分钟'}
function fuzzyMatch(q,t){q=q.toLowerCase().trim();t=t.toLowerCase().trim();if(!q)return!0;if(t.includes(q))return!0;let ti=0;for(let i=0;i<q.length;i++){const f=t.indexOf(q[i],ti);if(f===-1)return!1;ti=f+1}return!0}

const CATS=[
  {k:'meat',l:'荤菜',e:'🥩',c:'#E85D3F'},
  {k:'vegetarian',l:'素菜',e:'🥬',c:'#4CAF50'},
  {k:'seafood',l:'海鲜',e:'🦐',c:'#2196F3'},
  {k:'soup',l:'汤羹',e:'🍲',c:'#FF9800'},
  {k:'staple',l:'主食',e:'🍚',c:'#8D6E63'},
  {k:'dessert',l:'甜品',e:'🍰',c:'#E91E63'},
];
const CAT_MAP=Object.fromEntries(CATS.map(c=>[c.k,c]));
const DIFF_MAP={1:'简单',2:'中等',3:'困难'};
