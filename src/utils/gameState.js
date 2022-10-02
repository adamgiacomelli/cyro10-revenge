/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
import { Input } from 'phaser';
import { BROKEN_OBJECT_SPRITE_NAME, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import { createInteractiveGameObject } from './utils';

import { INTRO_TEXT } from '../assets/text/intro_text';
import EVENTS_LIST from '../assets/text/events.json';

class Modifier {
    damage = 0
    type = null
    position = { x: 0, y: 0 }

    constructor(scene, position, type, initDamage = 0) {
        this.type = type;
        this.position = position;

        this.break(scene, initDamage);
    }

    repair() {
        this.damage -= 1;
        this.damageLabel?.setText(this.damage);
    }

    break(scene, degree) {
        if (degree > 0 && this.damage === 0) {
            this.createBrokenObject(scene, this.position);
        }
        this.damage += degree;
        this.damageLabel?.setText(this.damage);
    }

    isFixed() {
        return this.damage <= 0;
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

        this.damageLabel = scene.add.text(x, y, this.damage, {
            font: '12px "Press Start 2P"',
            align: 'center',
        });
        this.damageLabel.setStroke('#000000', 3);
        this.damageLabel.setDepth(11);

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
                        this.damageLabel.destroy();
                    }
                }
            }
        );
    }
}

const INTRO_PHASE = 'INTRO_PHASE'; 
export default class GameState {
  progress = INTRO_PHASE

  resourceState = {
      power: 98.21,
      oxygen: 99.1,
      food: 99.02,
      fuel: 83.02,
  };

  modifiers = {
      oxygen: [{ x: 32, y: 17 }, { x: 32, y: 20 }],
      power: [{ x: 5, y: 18 }],
      fuel: [{ x: 17, y: 24 }, { x: 18, y: 24 }, { x: 18, y: 23 }, { x: 18, y: 24 }],
      food: [{ x: 11, y: 9 }, { x: 12, y: 9 }, { x: 13, y: 9 }, { x: 11, y: 10 }, { x: 12, y: 10 }, { x: 13, y: 10 }],
  };

  timeleft = 10;

  constructor(scene) {
      this.setupUi(scene);

      this.resourceState = {
          power: 100,
          oxygen: 100,
          food: 100,
          fuel: 100,
      };

      this.modifiers.oxygen.forEach((part, idx, arr) => {
          arr[idx] = new Modifier(scene, part);
      });
      this.modifiers.food.forEach((part, idx, arr) => {
          arr[idx] = new Modifier(scene, part);
      });
      this.modifiers.fuel.forEach((part, idx, arr) => {
          arr[idx] = new Modifier(scene, part);
      });
      this.modifiers.power.forEach((part, idx, arr) => {
          arr[idx] = new Modifier(scene, part);
      });

      setInterval(() => {
          if (this.timeleft === 0) {
              this.timeleft = 11;

              this.createIncident(scene);
          }
          this.timeleft -= 1;
      }, 1000);
  }

  createIncident(scene) {
      const random = Math.floor(Math.random() * EVENTS_LIST.length());
      const event = EVENTS_LIST[random];

      scene.events.emit('showDialog', [`${event.title}\n\n${event.description}`]);

      this.modifiers.oxygen[0].break(scene, 3);
  }

  setupUi(scene) {
      this.uiScene = scene.scene.get('UiScene');
      this.uiScene.scene.start();
  }

  update(scene, time, delta) {
      if (this.progress === INTRO_PHASE) {
          scene.events.emit('showDialog', INTRO_TEXT);
      }

      this.resourceState.fuel -= 0.00001 * delta;
  }
}
