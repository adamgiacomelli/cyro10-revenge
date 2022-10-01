import { Scene } from 'phaser';

// Utils
import {
    handleCreateMap,
    handleCreateHero,
    handleObjectsLayer,
    handleHeroMovement,
    handleCreateGroups,
    handleCreateControls,
    handleConfigureCamera,
    handleConfigureGridEngine,
    handleCreateHeroAnimations,
    handleCreateCharactersMovements,
} from '../../utils/sceneHelpers';

// Utils
import { getDispatch } from '../../utils/utils';

// Actions
import setGameCameraSizeUpdateCallbackAction from '../../redux/actions/game/setGameCameraSizeUpdateCallbackAction';

export default class GameScene extends Scene {
    hud = {}

    constructor() {
        super('GameScene');
    }

    create() {
        const dispatch = getDispatch();

        // All of these functions need to be called in order

        // Create controls
        handleCreateControls(this);

        // Create game groups
        handleCreateGroups(this);

        // Create the map
        handleCreateMap(this);

        // Create hero sprite
        handleCreateHero(this);

        // Configure grid engine
        handleConfigureGridEngine(this);

        // Load game objects like items, enemies, etc
        handleObjectsLayer(this);

        // Configure the main camera
        handleConfigureCamera(this);
        dispatch(setGameCameraSizeUpdateCallbackAction(() => {
            handleConfigureCamera(this);
        }));

        // Hero animations
        handleCreateHeroAnimations(this);

        // Handle characters movements
        handleCreateCharactersMovements(this);

        this.hud.text = this.add.text(this.heroSprite.x, this.heroSprite.y, 'Mjavc', { font: '"Press Start 2P"' });
        this.hud.text.setDepth(100)
    }

    update(time, delta) {
        handleHeroMovement(this);
        this.heroSprite.update(time, delta);

        this.hud.text.setPosition(this.heroSprite.x, this.heroSprite.y);
    }
}
