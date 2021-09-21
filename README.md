## nquizr

_nquizr_ is a firefox extension that enables user to add notes and word lists to https://nrk.no articles ( basic articles only for now ) in-place.
All added information is stored locally and is not shared accross network.

#### User stories
- [ ] add a way to delete all texts and word list from particular article
- [ ] add a way to delete all texts and word list added by plugin


### additional notes
Plugin uses a pure Javascript implementation of SipHash from https://github.com/jedisct1/siphash-js ,
particularly this script https://raw.githubusercontent.com/jedisct1/siphash-js/master/lib/siphash13.js.min .
