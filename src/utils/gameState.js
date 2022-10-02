/* eslint-disable max-classes-per-file */
import { Input } from 'phaser';
import { BROKEN_OBJECT_SPRITE_NAME, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import { createInteractiveGameObject } from './utils';

const START_TIME = 32527384553000;
const DECIMALS = 2;

const locations = [
    { x: 12, y: 12 },
    { x: 11, y: 12 },
    { x: 10, y: 12 },
    { x: 9, y: 12 },
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 12, y: 10 },
    { x: 12, y: 11 },
];

class Modifier {
    repairNeeded = 1
    constructor(scene, position, repairNeeded) {
        this.repairNeeded = repairNeeded ?? 1;
        this.createBrokenObject(scene, position);
    }

    repair() {
        this.repairNeeded -= 1;
    }

    isFixed() {
        return this.repairNeeded <= 0;
    }

    createBrokenObject(scene, position) {
        const x = position.x * TILE_WIDTH;
        const y = position.y * TILE_HEIGHT;
        const objectIndex = 1;
        const name = `${BROKEN_OBJECT_SPRITE_NAME}_${objectIndex}`;
        const brokenObject = scene.physics.add
            .sprite(x, y, BROKEN_OBJECT_SPRITE_NAME)
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

        const customCollider = createInteractiveGameObject(
            scene,
            x,
            y,
            TILE_WIDTH,
            TILE_HEIGHT
        );

        const overlapCollider = scene.physics.add.overlap(
            scene.heroSprite.actionCollider,
            customCollider,
            () => {
                if (Input.Keyboard.JustDown(scene.actionKey)) {
                    console.log('Repairing');
                    this.repair();
                    if (this.isFixed()) {
                        scene.physics.world.removeCollider(overlapCollider);
                        customCollider.destroy();
                        brokenObject.setVisible(false);
                        brokenObject.destroy();
                    }
                }
            }
        );
    }
}

export default class GameState {
  hud = {};

  resourceState = {
      electric: 98.21,
      oxygen: 99.1,
      food: 99.02,
      fuel: 83.02,
  };

  modifiers = [];

  timeleft = 10;

  constructor(scene) {
      this.hud.timedate = scene.add.text(0, 0, this.getTimeText(), {
          font: '"Press Start 2P"',
      });
      this.hud.resources = scene.add.text(0, 30, this.getHudText(), {
          font: '"Press Start 2P"',
      });

      this.hud.timerText = scene.add.text(TILE_WIDTH * 15, 0, `Next problem in ${10}`, {
          font: '"Press Start 2P"',
          color: '#FF0000',
      });

      this.resourceState = {
          electric: 100,
          oxygen: 100,
          food: 100,
          fuel: 100,
      };

      setInterval(() => {
          if (this.timeleft === 0) {
              this.timeleft = 11;

              const random = Math.floor(Math.random() * locations.length);
              this.modifiers.push(new Modifier(scene, locations[random], 3));
              const random2 = Math.floor(Math.random() * locations.length);
              this.modifiers.push(new Modifier(scene, locations[random2], 3));
          }
          this.timeleft -= 1;
      }, 1000);
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

      this.hud.timerText.setText(`Next problem in ${this.timeleft}`);
  }
}
