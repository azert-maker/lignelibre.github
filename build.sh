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
JS="10-core.js 15-fx.js 16-sfx-data.js 17-assets.js 18-glb.js 20-gear.js 30-ads-net.js 35-valley.js 36-places.js 37-coins.js 40-wingsuit.js 41-downhill.js 44-snowboard.js 45-park.js 46-bmx.js 47-moto.js 48-wake.js 49-parkour.js 50-ui.js 52-claw.js 55-engage.js 57-progress.js 58-replay.js 60-main.js"
SCRIPTS() {
  # versions figées + empreintes SRI : le navigateur refuse un fichier modifié sur le CDN
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" integrity="sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu" crossorigin="anonymous"></script>'
  echo '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js" integrity="sha384-fljlqkjWlmSFjkESkQvm77heIZpoWmXEOzlCA7kOpGUH+95Zk0yGfQieWM2q136E" crossorigin="anonymous"></script>'
  echo '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/SkeletonUtils.js" integrity="sha384-48sEMz1pIoO9ktrDus6dw7q9KVj242/vYNeNwDA4Lom38S7Sutog0tJLSqRBBZa6" crossorigin="anonymous"></script>'
  echo '<script>'; cat $JS; echo '</script>'
}
{ cat 01-head.html 02-body.html; SCRIPTS; } > dist/ligne-libre.html
{ printf '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'; cat 01-head.html; printf '</head>\n<body>\n'; cat 02-body.html; SCRIPTS; printf '</body>\n</html>\n'; } > dist/ligne-libre-standalone.html
cp dist/ligne-libre-standalone.html dist/test.html
# site public (GitHub Pages) : un seul fichier, aucun chemin relatif ; .nojekyll = servi tel quel
mkdir -p dist/site
sed 's#<meta charset="utf-8">#<meta charset="utf-8">\n<meta name="description" content="Ligne Libre : jeu de sports extrêmes arcade en 3D dans le navigateur. Wingsuit, downhill, snowboard, BMX, motocross, wakeboard, parkour.">\n<meta property="og:title" content="Ligne Libre">\n<meta property="og:description" content="Sept sports extrêmes arcade en 3D, jouables dans le navigateur.">\n<meta name="robots" content="index,follow">#' dist/ligne-libre-standalone.html > dist/site/index.html
cat > dist/site/404.html <<'H404'
<!doctype html><meta charset="utf-8"><title>Ligne Libre</title><script>location.replace(location.pathname.split('/').slice(0,2).join('/')+'/')</script><a href="./">Ligne Libre</a>
H404
: > dist/site/.nojekyll
cat $JS > dist/bundle.js
if [ "${LL_COPY_PARENT:-1}" != 0 ] && [ -w .. ]; then
  cp dist/ligne-libre.html ../ligne-libre.html
  cp dist/ligne-libre-standalone.html ../ligne-libre-standalone.html
  cp dist/test.html ../test3.html
  cp dist/bundle.js ../g3.js
fi
