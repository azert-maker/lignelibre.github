#!/bin/sh
# Assemble Ligne Libre.
#  ../ligne-libre.html             : fragment pour l'Artifact claude.ai (l'outil ajoute lui-même doctype/head/body)
#  ../ligne-libre-standalone.html  : document HTML complet et valide (un seul <head> avec title, metas, polices, style ; un seul <body>)
cd "$(dirname "$0")"
JS="10-core.js 15-fx.js 16-sfx-data.js 20-gear.js 30-ads-net.js 35-valley.js 40-wingsuit.js 41-downhill.js 42-foil.js 43-paraglide.js 44-snowboard.js 50-ui.js 55-engage.js 57-progress.js 58-replay.js 60-main.js"
SCRIPTS() { echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'; echo '<script>'; cat $JS; echo '</script>'; }
{ cat 01-head.html 02-body.html; SCRIPTS; } > ../ligne-libre.html
{ printf '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'; cat 01-head.html; printf '</head>\n<body>\n'; cat 02-body.html; SCRIPTS; printf '</body>\n</html>\n'; } > ../ligne-libre-standalone.html
cp ../ligne-libre-standalone.html ../test3.html
cat $JS > ../g3.js
