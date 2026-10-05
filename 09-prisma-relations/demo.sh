cd "$(dirname "$0")"
PORT=3000 node src/server.js > server.log 2>&1 &
pid=$!
trap 'kill $pid' EXIT
sleep 1
run() {
  echo "\$ $1"
  eval "$1 -s -w '\nHTTP %{http_code}\n'"
  echo
}
run "curl 'http://localhost:3000/api/products?search=phone&minPrice=200&maxPrice=1000&page=1&limit=10'"
run "curl 'http://localhost:3000/api/products?category=electronics&inStock=true&sortBy=price&sortOrder=asc'"
run "curl 'http://localhost:3000/api/products?sortBy=price&sortOrder=desc&limit=3&page=2'"
run "curl 'http://localhost:3000/api/products/stats'"
