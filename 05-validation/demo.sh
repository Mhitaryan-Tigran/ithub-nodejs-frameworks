cd "$(dirname "$0")"
PORT=3000 node src/index.js > server.log 2>&1 &
pid=$!
trap 'kill $pid' EXIT
sleep 1
run() {
  echo "\$ $1"
  eval "$1 -s -w '\nHTTP %{http_code}\n'"
  echo
}
run "curl -X POST http://localhost:3000/users -H 'Content-Type: application/json' -d '{\"name\":\"Alice\",\"email\":\"alice@example.com\",\"age\":25}'"
run "curl -X POST http://localhost:3000/users -H 'Content-Type: application/json' -d '{\"name\":\"A\",\"email\":\"not-email\",\"age\":-5}'"
run "curl -X POST http://localhost:3000/users -H 'Content-Type: application/json' -d '{\"name\":\"Bob\",\"email\":\"bob@example.com\",\"age\":30,\"extra\":\"field\"}'"
run "curl 'http://localhost:3000/users'"
run "curl 'http://localhost:3000/users?limit=500&order=sideways'"
run "curl -X POST http://localhost:3000/v2/users -H 'Content-Type: application/json' -d '{\"name\":\"\",\"email\":\"bad\",\"age\":200}'"
run "curl -X POST http://localhost:3000/v2/users -H 'Content-Type: application/json' -d '{\"name\":\"  Carol \",\"email\":\"Carol@Example.com\",\"age\":\"41\"}'"
