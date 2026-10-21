---
title: Sources and Credits
eyebrow: Further reading
permalink: /sources/
description: "Books, studies, reports and videos behind Groundation's guide to Rastafari."
---

## Books and studies

- Barry Chevannes, *Rastafari: Roots and Ideology* (Syracuse University Press, 1994)
- Leonard E. Barrett, *The Rastafarians* (Beacon Press, 1977; revised 1997)
- Ennis B. Edmonds, *Rastafari: From Outcasts to Culture Bearers* (Oxford University Press, 2003)
- Ennis B. Edmonds, *Rastafari: A Very Short Introduction* (Oxford University Press, 2012)
- Robert A. Hill, *Dread History: Leonard P. Howell and Millenarian Visions in the Early Rastafari Religion* (2001)
- Hélène Lee, *The First Rasta: Leonard Howell and the Rise of Rastafarianism* (Lawrence Hill Books, 2003)
- M. G. Smith, Roy Augier and Rex Nettleford, *The Rastafari Movement in Kingston, Jamaica* (University College of the West Indies, 1960)
- Velma Pollard, *Dread Talk: The Language of Rastafari* (1994; expanded 2000)
- Giulia Bonacci, *Exodus! Heirs and Pioneers, Rastafari Return to Ethiopia* (University of the West Indies Press, 2015)
- Jahlani Niaah and Erin MacLeod (eds), *Let Us Start with Africa: Foundations of Rastafari Scholarship* (2013)
- Maureen Rowe, "The Woman in Rastafari", *Caribbean Quarterly* 26:4 (1980)
- Obiagele Lake, *Rastafari Women: Subordination in the Midst of Liberation Theology* (Carolina Academic Press, 1998)
- Barbara Makeda Blake Hannah, *Rastafari: The New Creation* (1981)
- Walter Rodney, *The Groundings with My Brothers* (1969)
- Deborah A. Thomas and John L. Jackson Jr, *Bad Friday: Rastafari After Coral Gardens* (documentary, 2011)

## Reports and news

- Office of the Public Defender, Jamaica, report on the Coral Gardens incident (2015)
- [Global Voices: Jamaican PM apologises for 1963 killings (2017)](https://globalvoices.org/2017/04/07/jamaican-prime-minister-apologizes-to-rastafarian-community-for-1963-killings/)
- [The Gleaner: Land titles handed over to Rastafari community (April 2026)](https://jamaica-gleaner.com/article/news/20260406/land-titles-handed-over-rastafari-community-coral-gardens-redress-effort)
- [Citizenship Rights in Africa: Ethiopia to give ID cards to Rastafarians (2017)](https://citizenshiprightsafrica.org/ethiopia-to-give-id-cards-to-rastafarians-long-stateless/)
- [Africa Is a Country: Rastafari in Ethiopia and Shashamane (2017)](https://africasacountry.com/2017/08/encountering-the-promised-land-rastafari-in-ethiopia-and-shashamane)

## Videos

{% for key, v in videos %}- [{{ v.title }}](https://www.youtube.com/watch?v={{ v.id }}), {{ v.channel }}
{% endfor %}

## Photographs

{% for key, m in images %}{% if m.credit %}- {{ m.caption }} {{ m.credit | safe }}
{% endif %}{% endfor %}
Photographs not credited above are placeholders awaiting final images.

## Design and code

Illustrations, map and drum synthesis created for this site. Typefaces: Big Shoulders Display and Literata, both under the SIL Open Font License, served from this site. Animation by GSAP (GreenSock), served from this site under its standard licence. Map outline derived from Natural Earth (public domain).
