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
echo "fake image content" > test.jpg
echo "test" > test.txt
head -c 3000000 /dev/zero > big.png
run "curl -X POST http://localhost:3000/upload/avatar -F 'avatar=@test.jpg'"
run "curl -X POST http://localhost:3000/upload/avatar -F 'avatar=@test.txt'"
run "curl -X POST http://localhost:3000/upload/avatar -F 'avatar=@big.png'"
run "curl -X POST http://localhost:3000/upload/documents -F 'documents=@test.txt' -F 'documents=@test.txt'"
run "curl -X POST http://localhost:3000/upload/profile -F 'name=Alice' -F 'bio=Backend developer' -F 'avatar=@test.jpg'"
url=$(curl -s -X POST http://localhost:3000/upload/avatar -F 'avatar=@test.jpg' | sed 's/.*"url":"\([^"]*\)".*/\1/')
run "curl http://localhost:3000$url"
rm -f test.jpg test.txt big.png
