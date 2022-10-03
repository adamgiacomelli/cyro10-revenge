/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
import { Input } from 'phaser';
import { BROKEN_OBJECT_SPRITE_NAME, TILE_HEIGHT, TILE_WIDTH } from '../constants';
import { createInteractiveGameObject } from './utils';

import EVENTS_LIST from '../assets/text/events.json';
import COORDINATES from '../assets/text/coordinates.json';

import { INTRO_TEXT_1, INTRO_TEXT_2, INTRO_TEXT_3 } from '../assets/text/intro_text';

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
const INTRO_PHASE_2 = 'INTRO_PHASE_2';
const INTRO_PHASE_3 = 'INTRO_PHASE_3';
const INTRO_PHASE_4 = 'INTRO_PHASE_4';
const INTRO_PHASE_FIN = 'INTRO_PHASE_FIN';

export default class GameState {
  progress = INTRO_PHASE

  resourceState = {
      power: 98.21,
      oxygen: 99.1,
      food: 99.02,
      fuel: 83.02,
  };

  modifiers = {
      oxygen: [],
      power: [],
      fuel: [],
      food: [],
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

      COORDINATES.forEach((e) => {
          e.coordinates.forEach((coord) => {
              const pos = coord.pos.split(',');
              const position = { x: Number.parseInt(pos[0], 10) + 11, y: Number.parseInt(pos[1], 10) };
              this.modifiers[e.type].push(new Modifier(scene, position));
          });
      });

      setInterval(() => {
          if (this.timeleft === 0) {
              this.timeleft = 11;

              this.createIncident(scene);
          }
          if (!this.paused) {
              this.timeleft -= 1;
          }
      }, 1000);

      scene.input.keyboard.on('keyup-SPACE', (event) => {
          console.log(this.progress);
          switch (this.progress) {
              case INTRO_PHASE_2:
                  this.progress = INTRO_PHASE_3;

                  scene.events.emit('showDialog', INTRO_TEXT_2);
                  break;
              case INTRO_PHASE_3:
                  this.progress = INTRO_PHASE_4;

                  scene.events.emit('showDialog', INTRO_TEXT_3);
                  break;
              case INTRO_PHASE_4:
                  this.progress = INTRO_PHASE_FIN;

                  scene.events.emit('hideDialog');
                  break;

              default:
                  scene.events.emit('hideDialog');

                  break;
          }
      });
  }

  createIncident(scene) {
      const random = Math.floor(Math.random() * EVENTS_LIST.length);
      const event = EVENTS_LIST[random];

      const text = `${event.title}\n\n${event.description}`;

      scene.events.emit('showDialog', text);
      event.modifiers.forEach((mod) => {
          const key = Object.keys(mod)[0];
          const randomMod = Math.floor(Math.random() * this.modifiers[key].length);
          this.modifiers[key][randomMod].break(scene, 1);
      });
  }

  pause() {
      this.paused = true;
  }

  unpause() {
      this.paused = false;
  }

  setupUi(scene) {
      this.uiScene = scene.scene.get('UiScene');
      this.uiScene.scene.start();
  }

  reduceResourceByDamaged(type, delta) {
      this.modifiers[type].forEach((mod) => {
          if (!mod.isFixed()) {
              this.resourceState[type] -= 0.0001 * delta * mod.damage;
          }
      });
  }

  update(scene, time, delta) {
      if (this.progress === INTRO_PHASE) {
          this.progress = INTRO_PHASE_2;
          scene.events.emit('showDialog', INTRO_TEXT_1);
      }

      if (!this.paused) {
          this.resourceState.fuel -= 0.00001 * delta;
          this.reduceResourceByDamaged('oxygen', delta);
          this.reduceResourceByDamaged('fuel', delta);
          this.reduceResourceByDamaged('food', delta);
          this.reduceResourceByDamaged('power', delta);
      }
  }
}
