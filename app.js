function calc() {
  const h = +hosts.value
  const s = +socketsPerHost.value
  const c = +coresPerSocket.value
  const pc = +currentPricePerCore.value
  const ps = +targetPricePerSocket.value
  const m = +migrationCost.value

  const cores = h * s * c
  const sockets = h * s

  const current = cores * pc
  const target = sockets * ps
  const savings = current - target

  const payback = savings > 0 ? (m / savings).toFixed(2) : "N/A"

  result.innerText =
    `Current: $${current}\nTarget: $${target}\nSavings: $${savings}\nPayback: ${payback} years`
}

document.querySelectorAll("input").forEach(i =>
  i.addEventListener("input", calc)
)

calc()