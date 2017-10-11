library.define(
  "a-panel-bond",[
  "issue-bond",
  "inches",
  "sell-bond",
  "./host-from-site"],
  function(issueBond, inches, sellBond, hostFromSite) {

    issueBond(
      "a-panel",
      "Wall panel A",
      "Erik Pukinskis")

    // Basic materials
    var studWidth = 1.25
    var studDepth = 2.5

    // House parameters
    var sheathingOverlap = 1/2*studWidth
    var blockWidth = 1/2*studDepth
    var wallHeight = 88

    // A panel parameters
    var trackLength = 48 - studWidth - sheathingOverlap - blockWidth
    var insideSheathingWidth = 48 - studDepth - sheathingOverlap*3 - blockWidth 

    issueBond.tasks(
      "a-panel",[
      "reserve a truck",
      "buy materials",
      "cut 4 steel studs to "+inches(wallHeight),
      "cut 2 steel tracks to "+inches(trackLength),
      "plane an "+inches(wallHeight)+" inch 2x6 to 1 1/4 inch thick, and cut three 1 1/14 inch slices out of it",
      "cut finish plywood to "+inches(wallHeight)+" by "+inches(insideSheathingWidth),
      "cut rough plywood to "+inches(wallHeight)+" by "+inches(insideSheathingWidth),
      "crimp steel framing together",
      "square and screw down finish plywood",
      "flip, insulate, and screw down rough plywood, with a 3 inch gap below, and a "+inches(studDepth)+" gap to the left",])

    var PRICE_FACTOR = 1.2 // tax and price fluctuation
    var HOURLY_RATE = 1500
    var WAGE_FACTOR = 1.5 // payroll tax, etc

    function purchase(amt) {
      return toDollarString(amt*PRICE_FACTOR)
    }

    function labor(hours) {
      return toDollarString(hours*HOURLY_RATE*WAGE_FACTOR)
    }

    issueBond.expenses(
      "a-panel",{
      "Truck rental": purchase(40),
      "8 foot steel studs, 4x": purchase(357*4),
      "10 foot steel track, 1x": purchase(433),
      "3/8 inch rouch plywood, 1x": purchase(1795),
      "3/8 inch finish plywood, 1x": purchase(1533),
      "16 inch insulation, 22 feet": purchase(47*22),
      "screws, 60x": purchase(300),
      "labor, 4 hours": labor(4)})

    host.onSite(
      function(site) {
        sellBond(
          "a-panel",
          site)})})