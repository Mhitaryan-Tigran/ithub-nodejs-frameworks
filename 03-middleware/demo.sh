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
run "curl http://localhost:3000/health"
run "curl -X POST http://localhost:3000/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"secret\"}'"
run "curl http://localhost:3000/profile"
run "curl http://localhost:3000/profile -H 'Authorization: Bearer valid-token'"
run "curl -X POST http://localhost:3000/users -H 'Content-Type: application/json' -H 'Authorization: Bearer valid-token' -d '{\"name\":\"Alice\",\"age\":25,\"city\":\"Moscow\"}'"
run "curl -X POST http://localhost:3000/users -H 'Content-Type: application/json' -H 'Authorization: Bearer valid-token' -d '{\"name\":\"\",\"age\":\"not-a-number\"}'"
run "curl http://localhost:3000/unknown"
sleep 0.3
echo "--- server log ---"
sed $'s/\x1b\\[[0-9;]*m//g' server.log
