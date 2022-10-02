import { Input, Scene } from 'phaser';
import { TILE_WIDTH } from '../../constants';

const START_TIME = 32527384553000;
const DECIMALS = 2;
const FONT_DEF = '12px Courier New';
const FONT_DEF_LARGE = 'bold 16px Courier New';

export default class UiScene extends Scene {
  hud = {};
  box;
  boxText
  nextSlide;

  constructor() {
      super('UiScene');
  }

  create() {
      this.nextSlide = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);

      this.setupUi();

      const gameScene = this.scene.get('GameScene');

      //  Listen for events from it
      gameScene.events.on('showDialog', (text) => {
        this.showDialog(text);
      }, this);
  }

  setupUi() {
      this.hud.timedate = this.add.text(5, 5, 'loading', {
          font: FONT_DEF,
      });

      this.hud.resources = this.add.text(5, 35, 'loading', {
          font: FONT_DEF,
      });

      this.hud.timerText = this.add.text(TILE_WIDTH * 40, 5, `Next problem in ${10}`, {
          font: FONT_DEF_LARGE,
          color: '#FF0000',
      });

      const { game } = this.sys;
      this.box = this.add.rectangle(
          game.scale.gameSize.width / 2,
          game.scale.gameSize.height / 2,
          500, 400,
          '0x000000'
      )
          .setOrigin(0.5)
          .setStrokeStyle(4, '0xFFFFFF');

      const text = '';
      this.boxText = this.add.text(
          (game.scale.gameSize.width / 2) - 250 + 10,
          (game.scale.gameSize.height / 2) - 200 + 10,
          text, {
              font: FONT_DEF,
          }
      );
      this.boxText.setDepth(11);

      this.box.setVisible(false);
      this.boxText.setVisible(false);
      console.log('setupUI');
  }

  showDialog(textArray) {
      this.dialogShown = true;

      this.box.setVisible(true);
      this.boxText.setVisible(true);

      let index = 0;
      this.boxText.setText(textArray[index]);

      this.input.keyboard.on('keyup-SPACE', (event) => {
          index += 1;
          if (textArray.length > index) {
              this.boxText.setText(textArray[index]);
          } else {
              this.box.setVisible(false);
              this.boxText.setVisible(false);
              this.dialogShown = false;
          }
      });
  }

  getTimeText = (time) => {
      const timetxt = `Stardate ${new Date(time + START_TIME).toLocaleString()}`;
      return timetxt;
  };

  getHudText = (gameState) => {
      const { power, oxygen, food, fuel } = gameState.resourceState;
      return `Power: ${power.toFixed(
          DECIMALS
      )}%\nOxygen: ${oxygen.toFixed(DECIMALS)}%\nFood: ${food.toFixed(
          DECIMALS
      )}%\nFuel: ${fuel.toFixed(DECIMALS)}%`;
  }

  update(time, delta) {
      const gameScene = this.scene.get('GameScene');

      this.hud.resources.setText(this.getHudText(gameScene.gameState));
      this.hud.timedate.setText(this.getTimeText(time));

      this.hud.timerText.setText(`Next problem in ${gameScene.gameState.timeleft}`);
  }
}
