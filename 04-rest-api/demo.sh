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
run "curl 'http://localhost:3000/api/v1/users?page=1&limit=5'"
run "curl 'http://localhost:3000/api/v1/users?minAge=25&sortBy=age&order=desc'"
run "curl -X POST http://localhost:3000/api/v1/users -H 'Content-Type: application/json' -d '{\"name\":\"Diana\",\"email\":\"diana@example.com\",\"age\":28}' -i"
run "curl -X POST http://localhost:3000/api/v1/users -H 'Content-Type: application/json' -d '{\"name\":\"Diana2\",\"email\":\"diana@example.com\",\"age\":30}'"
run "curl -X PATCH http://localhost:3000/api/v1/users/1 -H 'Content-Type: application/json' -d '{\"age\":26}'"
run "curl -X DELETE http://localhost:3000/api/v1/users/1"
run "curl http://localhost:3000/api/v1/users/1"
run "curl http://localhost:3000/api/v1/users/2/orders"
run "curl -X POST http://localhost:3000/api/v1/users -H 'Content-Type: application/json' -d '{\"name\":\"X\",\"email\":\"nope\"}'"
