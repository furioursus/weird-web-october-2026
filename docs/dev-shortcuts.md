# Dev shortcuts

Some days take a `?jump=` query parameter in `npm run dev` so I can skip ahead while testing. Production builds strip it.

| Day | Parameter | Skips to |
| --- | --- | --- |
| 1, Reveal | `?jump=unseal` | Every text redaction lifted, Exhibit A unsealed |
| 1, Reveal | `?jump=photo` | Exhibit A's cover lifted, Dante still a smudge |
| 1, Reveal | `?jump=dante` | The reveal and DECLASSIFIED slam, without saving the cat as found |
| 2, Spark | `?jump=charge` | A full 25 kV charge, ready to zap |
| 2, Spark | `?jump=lights` | The power back on, without saving the cat as found (Tybalt stays unclickable until a zap) |
| 3, Fake | `?jump=wheel` | The prize wheel opens at once, even if it was already shown this session |
| 3, Fake | `?jump=shop` | Straight to the shop with the coupon countdown running, no wheel |
| 4, Plastic | `?jump=hatched` | Hatched and remotely hungry, as if coming back to him |
| 4, Plastic | `?jump=hungry` | Hatched at 1 heart, already going for plastic |
| 4, Plastic | `?jump=chewed` | Every bite taken out of the shell, without saving them |
| 7, Organic | `?jump=settled` | 1,500 steps unfed: the resting network, its stain and Dante revealed |
| 7, Organic | `?jump=grown` | Seven oats around Dante's patch and 1,400 steps of feeding |

## Finding which file renders something

In `npm run dev`, Astro stamps every element in the page body with `data-astro-source-file` and `data-astro-source-loc` (line:column), so the browser's element inspector shows the file an element was typed in. Slotted markup names the page it was written in, not the layout it renders inside. For an opening tag that spans several lines, the line points at its closing `>`. Builds carry none of these attributes.
