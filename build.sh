#!/bin/sh
# Assemble Ligne Libre en un seul fichier HTML.
#   dist/ligne-libre.html             fragment pour l'artifact claude.ai (l'outil ajoute doctype/head/body)
#   dist/ligne-libre-standalone.html  document HTML complet (à ouvrir dans un navigateur)
#   dist/test.html                    copie du standalone pour les tests Playwright
#   dist/bundle.js                    JS seul (vérification de syntaxe : node --check)
# Les modèles GLB de assets/glb/ sont embarqués en base64 (fichier généré 17-assets.js) :
# le jeu reste un fichier unique, sans serveur d'assets.
# LL_COPY_PARENT=0 désactive la copie historique vers ../ (dossier de travail).
set -e
cd "$(dirname "$0")"
mkdir -p dist
{
  echo "/* FICHIER GÉNÉRÉ par build.sh : modèles GLB embarqués (ne pas éditer à la main) */"
  printf 'const ASSET_GLB={'
  first=1
  for f in assets/glb/*.glb; do
    [ -e "$f" ] || continue
    n=$(basename "$f" .glb)
    [ $first = 1 ] || printf ','
    first=0
    printf '"%s":"' "$n"; base64 -w0 "$f"; printf '"'
  done
  echo '};'
} > 17-assets.js
JS="10-core.js 15-fx.js 16-sfx-data.js 17-assets.js 18-glb.js 20-gear.js 30-ads-net.js 35-valley.js 40-wingsuit.js 41-downhill.js 44-snowboard.js 45-park.js 46-bmx.js 47-moto.js 48-wake.js 49-parkour.js 50-ui.js 55-engage.js 57-progress.js 58-replay.js 60-main.js"
SCRIPTS() {
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
  echo '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>'
  echo '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js"></script>'
  echo '<script>'; cat $JS; echo '</script>'
}
{ cat 01-head.html 02-body.html; SCRIPTS; } > dist/ligne-libre.html
{ printf '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'; cat 01-head.html; printf '</head>\n<body>\n'; cat 02-body.html; SCRIPTS; printf '</body>\n</html>\n'; } > dist/ligne-libre-standalone.html
cp dist/ligne-libre-standalone.html dist/test.html
cat $JS > dist/bundle.js
if [ "${LL_COPY_PARENT:-1}" != 0 ] && [ -w .. ]; then
  cp dist/ligne-libre.html ../ligne-libre.html
  cp dist/ligne-libre-standalone.html ../ligne-libre-standalone.html
  cp dist/test.html ../test3.html
  cp dist/bundle.js ../g3.js
fi
