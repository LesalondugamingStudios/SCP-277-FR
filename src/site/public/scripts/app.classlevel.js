let paragraph = $(".category-infos > span > p:nth-child(2)")[0]

if(paragraph && paragraph.innerHTML.includes("🔶")) {
  $(paragraph).hide()
  $("#classinfo").show()
}