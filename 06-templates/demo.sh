cd "$(dirname "$0")"
PORT=3000 node src/index.js > server.log 2>&1 &
pid=$!
trap 'kill $pid' EXIT
sleep 1
body=$(mktemp)
run() {
  echo "\$ $1"
  eval "$1 -s -o "$body" -w 'HTTP %{http_code}, %{content_type}, %{size_download} bytes\n'"
  grep -o '<title>[^<]*</title>\|<h1>[^<]*\|<strong>[^<]*' "$body" | head -8
  echo
}
run "curl http://localhost:3000/"
run "curl http://localhost:3000/users"
run "curl 'http://localhost:3000/users?role=admin'"
run "curl http://localhost:3000/users/1"
run "curl http://localhost:3000/users/999"
run "curl http://localhost:3000/emails/welcome/1"
echo "\$ curl -I http://localhost:3000/css/style.css"
curl -sI http://localhost:3000/css/style.css | grep -i 'HTTP/\|content-type\|cache-control'
