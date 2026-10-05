cd "$(dirname "$0")"
PORT=3000 node src/index.js > server.log 2>&1 &
pid=$!
trap 'kill $pid' EXIT
node prisma/seed.js > /dev/null
sleep 1
run() {
  echo "\$ $1"
  eval "$1 -s -w '\nHTTP %{http_code}\n'"
  echo
}
J="-H 'Content-Type: application/json'"
run "curl 'http://localhost:3000/api/users?page=1&limit=1'"
run "curl -X POST http://localhost:3000/api/users $J -d '{\"email\":\"carol@example.com\",\"name\":\"Carol\"}'"
run "curl -X POST http://localhost:3000/api/users $J -d '{\"email\":\"carol@example.com\",\"name\":\"Carol again\"}'"
run "curl -X PATCH http://localhost:3000/api/users/3 $J -d '{\"role\":\"ADMIN\"}'"
run "curl -X POST http://localhost:3000/api/posts $J -d '{\"title\":\"Tags via connectOrCreate\",\"content\":\"text\",\"published\":true,\"authorId\":3,\"tags\":[\"prisma\",\"new-tag\"]}'"
run "curl -X POST http://localhost:3000/api/posts $J -d '{\"content\":\"no title\",\"authorId\":\"abc\"}'"
run "curl 'http://localhost:3000/api/posts?search=prisma&published=true&page=1&limit=2'"
run "curl 'http://localhost:3000/api/posts?authorId=2'"
run "curl http://localhost:3000/api/posts/1"
run "curl -X PATCH http://localhost:3000/api/posts/3 $J -d '{\"published\":true,\"tags\":[\"express\",\"errors\"]}'"
run "curl http://localhost:3000/api/users/1"
run "curl -X DELETE http://localhost:3000/api/posts/5"
run "curl http://localhost:3000/api/posts/5"
run "curl -X DELETE http://localhost:3000/api/users/3"
run "curl http://localhost:3000/api/users/abc"
