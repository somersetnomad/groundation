---
key: quiz
order: 11
navLabel: Quiz
title: "Rastafari quiz: test your overstanding"
headline: 'Ten <span class="acc-g">questions</span>'
lede: "Every answer is somewhere in the chapters. No sign-up, and your score never leaves this device."
description: "A ten-question quiz on the lesser-known history of Rastafari."
---
<section class="sec"><div class="in">
<div class="quiz" id="quizBox" aria-live="polite"><p class="muted">The quiz needs JavaScript to run.</p></div>
<script type="application/json" id="quizData">{{ quiz | json | safe }}</script>
</div></section>
{% include "partials/share.njk" %}
