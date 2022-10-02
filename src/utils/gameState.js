import { BROKEN_OBJECT_SPRITE_NAME, TILE_HEIGHT, TILE_WIDTH } from '../constants';

const START_TIME = 32527384553000;
const DECIMALS = 2;

export default class GameState {
  hud = {};

  resourceState = {
      electric: 98.21,
      oxygen: 99.1,
      food: 99.02,
      fuel: 83.02,
  };

  modifiers = [];

  constructor(scene) {
      this.hud.timedate = scene.add.text(0, 0, this.getTimeText(), {
          font: '"Press Start 2P"',
      });
      this.hud.resources = scene.add.text(0, 30, this.getHudText(), {
          font: '"Press Start 2P"',
      });

      this.resourceState = {
          electric: 100,
          oxygen: 100,
          food: 100,
          fuel: 100,
      };

      this.createBrokenObject(scene, { x: 10, y: 10 });
  }

  getTimeText = (time) => {
      const timetxt = `Stardate ${new Date(time + START_TIME).toLocaleString()}`;
      return timetxt;
  };

  getHudText() {
      const { electric, oxygen, food, fuel } = this.resourceState;
      return `Electricity: ${electric.toFixed(
          DECIMALS
      )}%\nOxygen: ${oxygen.toFixed(DECIMALS)}%\nFood: ${food.toFixed(
          DECIMALS
      )}%\nFuel: ${fuel.toFixed(DECIMALS)}%`;
  }

  update(scene, time, delta) {
      this.resourceState.fuel -= 0.00001 * delta;
      this.hud.resources.setText(this.getHudText());
      this.hud.timedate.setText(this.getTimeText(time));
  }

  createBrokenObject = (scene, position) => {
      const { x, y } = position;
      const objectIndex = 1;
      const name = `${BROKEN_OBJECT_SPRITE_NAME}_${objectIndex}`;
      const brokenObject = scene.physics.add
          .sprite(x * TILE_WIDTH, y * TILE_HEIGHT, BROKEN_OBJECT_SPRITE_NAME)
          .setOrigin(0, 0)
          .setName(name)
          .setDepth(10);

      const animationKey = `${BROKEN_OBJECT_SPRITE_NAME}_idle`;
      if (!scene.anims.exists(animationKey)) {
          scene.anims.create({
              key: animationKey,
              frames: Array.from({ length: 2 }).map((n, index) => ({
                  key: BROKEN_OBJECT_SPRITE_NAME,
                  frame: `${BROKEN_OBJECT_SPRITE_NAME}_idle_${(index + 1).toString().padStart(2, '0')}`,
              })),
              frameRate: 3,
              repeat: -1,
              yoyo: false,
          });
      }

      brokenObject.anims.play(animationKey);

      scene.items.add(brokenObject);

      //   const customCollider = createInteractiveGameObject(
      //       scene,
      //       x,
      //       y,
      //       TILE_WIDTH,
      //       TILE_HEIGHT,
      //       { x, y }
      //   );

      //   const overlapCollider = scene.physics.add.overlap(
      //       scene.heroSprite,
      //       customCollider,
      //       () => {
      //           scene.physics.world.removeCollider(overlapCollider);
      //           console.log('gotit');
      //       }
      //   );
  }
}
