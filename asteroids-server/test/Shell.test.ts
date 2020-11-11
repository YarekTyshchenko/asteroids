import {COLLISION_DISTANCE, MAX_SPEED} from "../src/constants";
import {newShell} from "../src/model/shell";
import {Ship} from "../src/model/ship";
// Shell muzzle velocity is MAX_SPEED * 2
describe('shell velocity calculation', () => {
  const ship : Ship = {
    id: "A",
    position: {
      x: 0, y: 0
    },
    rotation: 0,
    thrust: 0,
    velocity: {
      x: 0, y: 0
    },
    bearing: 0
  }
  test("New shell starts with correct velocity", () => {
    const shell = newShell(ship)
    expect(shell.position.x).toBeCloseTo(COLLISION_DISTANCE)
    expect(shell.position.y).toBeCloseTo(0)
    expect(shell.velocity).toBeCloseTo(MAX_SPEED*2)
  })

  test("Shooting forward while moving", () => {
    ship.velocity.x = MAX_SPEED
    const shell = newShell(ship)
    expect(shell.position.x).toBeCloseTo(COLLISION_DISTANCE)
    expect(shell.position.y).toBeCloseTo(0)
    expect(shell.velocity).toBeCloseTo(MAX_SPEED*3)
  })

  test("Shooting backwards", () => {
    ship.velocity.x = MAX_SPEED
    ship.bearing = Math.PI
    const shell = newShell(ship)
    expect(shell.velocity).toBeCloseTo(MAX_SPEED)
  })

  test("Shooting backwards at double the speed", () => {
    ship.velocity.x = MAX_SPEED*3
    ship.bearing = Math.PI
    const shell = newShell(ship)
    expect(shell.velocity).toBeCloseTo(MAX_SPEED)
    expect(shell.bearing).toBeCloseTo(0)
  })
})
