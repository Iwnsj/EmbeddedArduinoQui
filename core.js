const StudyCore = (() => {
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function prepareQuiz(bank, topics, count, random = Math.random) {
    const pool = bank.filter(q => !topics.length || topics.includes(q.topic));
    const chosen = shuffle(pool, random).slice(0, Math.min(count, pool.length));
    return chosen.map(q => {
      const choices = shuffle(q.options.map((text,index) => ({text,index})),random);
      return {...q, options:choices.map(x=>x.text), answer:choices.findIndex(x=>x.index===q.answer)};
    });
  }
  function grade(questions, answers) {
    const rows = questions.map((q,i)=>({id:q.id,topic:q.topic,selected:answers[i]??null,correct:answers[i]===q.answer}));
    const correct=rows.filter(x=>x.correct).length;
    return {correct,total:questions.length,percent:questions.length?Math.round(correct/questions.length*100):0,rows};
  }
  function topicStats(attempts, topics) {
    return topics.map(topic=>{
      const rows=attempts.flatMap(a=>a.rows).filter(r=>r.topic===topic);
      return {topic,total:rows.length,correct:rows.filter(r=>r.correct).length,percent:rows.length?Math.round(rows.filter(r=>r.correct).length/rows.length*100):null};
    });
  }
  function loadProgress(raw, validTopics, validCards) {
    const base={completed:[],known:[],attempts:[]};
    try {
      const value=JSON.parse(raw);
      if(!value || typeof value!=='object')return base;
      const completed=Array.isArray(value.completed)?[...new Set(value.completed.filter(x=>validTopics.includes(x)))]:[];
      const known=Array.isArray(value.known)?[...new Set(value.known.filter(x=>validCards.includes(x)))]:[];
      const attempts=Array.isArray(value.attempts)?value.attempts.filter(a=>a && Number.isFinite(a.percent) && a.percent>=0 && a.percent<=100 && Number.isFinite(a.total) && a.total>0 && Number.isFinite(a.correct) && a.correct>=0 && a.correct<=a.total && Number.isFinite(a.date) && Array.isArray(a.rows) && a.rows.length===a.total && a.rows.every(r=>r&&validTopics.includes(r.topic)&&typeof r.correct==='boolean')).slice(-30):[];
      return {completed,known,attempts};
    } catch {return base;}
  }
  return {shuffle,prepareQuiz,grade,topicStats,loadProgress};
})();
if(typeof module!=='undefined')module.exports=StudyCore;
