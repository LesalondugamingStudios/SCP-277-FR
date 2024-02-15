$("#search").on("input", debounce(onSearch, 1000))

function debounce(fn, time) {
  var timer

  return function(){
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, time)
  }
}

async function onSearch() {
  let value = $(this).val()
  if(!value) {
    $("#showcase").show()
    $("#results").hide()
    return
  }

  $("#showcase").hide()
  $("#results").show()

  let lang = $("html").attr("lang")
  let type = location.href.includes("/scp") ? "scp" : "backrooms"

  let response = await fetch(`/search/json?lang=${lang}&keyword=${encodeURIComponent(value)}&type=${type}`)
  let data = await response.json()

  if(!response.ok) return $("#results").html(`<div class="alert alert-warning" role="alert">Fetch error: HTTP ${data.code} (${data.error})</div>`)
  if(!data.length) return $("#results").html(`<div class="alert alert-info" role="alert">No results</div>`)
  $("#results").html(data.map(d => `<div class="crow"><a class="searchresult${d.score >= 1 ? " match" : ""}" href="/${lang}/${type}/${type == "backrooms" ? `${d.id}-` : ""}${d.nb}">${type == "scp" ? `SCP-${d.nb.toUpperCase()} : ` : (d.id != "other" ? `${d.id.capitalize()} ${d.nb} : ` : "")}${d.name}</a></div>`).join(""))
}
