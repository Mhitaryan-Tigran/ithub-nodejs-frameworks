cd "$(dirname "$0")"
node prisma/seed.js > /dev/null
PORT=3000 node src/server.js > server.log 2>&1 &
pid=$!
trap 'kill $pid' EXIT
sleep 1
B=http://localhost:3000
J='Content-Type: application/json'
jar=cookies.txt
run() {
  echo "\$ $1"
  eval "$1 -s -w '\nHTTP %{http_code}\n'"
  echo
}
token() {
  curl -s -X POST $B/auth/login -H "$J" -d "{\"email\":\"$1\",\"password\":\"Password123\"}" | sed 's/.*"accessToken":"\([^"]*\)".*/\1/'
}
echo "\$ curl -I $B/health"
curl -sI $B/health | grep -iE 'HTTP/|x-frame|x-content-type|content-security|strict-transport'
echo
run "curl -X POST $B/auth/register -H '$J' -c $jar -d '{\"email\":\"carol@example.com\",\"name\":\"Carol\",\"password\":\"Password123\"}'"
run "curl -X POST $B/auth/register -H '$J' -d '{\"email\":\"carol@example.com\",\"name\":\"Carol\",\"password\":\"Password123\"}'"
run "curl -X POST $B/auth/login -H '$J' -c $jar -d '{\"email\":\"carol@example.com\",\"password\":\"Password123\"}'"
CAROL=$(token carol@example.com)
ALICE=$(token alice@example.com)
MOD=$(token moderator@example.com)
ADMIN=$(token admin@example.com)
run "curl $B/auth/me -H \"Authorization: Bearer \$CAROL\""
run "curl $B/auth/me"
run "curl -X POST $B/auth/refresh -b $jar"
run "curl -X POST $B/api/posts -H '$J' -H \"Authorization: Bearer \$CAROL\" -d '{\"title\":\"Carol writes\",\"published\":true,\"tags\":[\"auth\"]}'"
run "curl -X POST $B/api/posts -H '$J' -d '{\"title\":\"No token\"}'"
echo "# 1. Обычный пользователь пытается удалить чужой пост (пост 1 принадлежит Alice) — 403"
run "curl -X DELETE $B/api/posts/1 -H \"Authorization: Bearer \$CAROL\""
echo "# Владелец редактирует свой пост — 200"
run "curl -X PATCH $B/api/posts/1 -H '$J' -H \"Authorization: Bearer \$ALICE\" -d '{\"title\":\"Getting started with Prisma (edited)\"}'"
echo "# 2. Модератор удаляет любой пост — 204"
run "curl -X DELETE $B/api/posts/2 -H \"Authorization: Bearer \$MOD\""
echo "# 3. Обычный пользователь обращается к /api/users — 403, модератор — 200"
run "curl $B/api/users -H \"Authorization: Bearer \$CAROL\""
run "curl '$B/api/users?limit=2' -H \"Authorization: Bearer \$MOD\""
echo "# Смена роли: модератору нельзя, администратору можно"
run "curl -X PATCH $B/admin/users/5/role -H '$J' -H \"Authorization: Bearer \$MOD\" -d '{\"role\":\"MODERATOR\"}'"
run "curl -X PATCH $B/api/admin/users/5/role -H '$J' -H \"Authorization: Bearer \$ADMIN\" -d '{\"role\":\"MODERATOR\"}'"
run "curl -X POST $B/auth/logout -b $jar -c $jar"
run "curl -X POST $B/auth/refresh -b $jar"
echo "# Rate limit: 11 попыток входа подряд"
for i in $(seq 1 11); do
  printf '%s ' "$(curl -s -o /dev/null -w '%{http_code}' -X POST $B/auth/login -H "$J" -d '{"email":"x@example.com","password":"Wrong12345"}')"
done
echo
rm -f "$jar"
