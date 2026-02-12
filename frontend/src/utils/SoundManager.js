import { Howl } from 'howler';

// Placeholder sounds (Base64 or online URLs)
// In a real production app, these would be local assets in /public/sounds/

const sounds = {
    click: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], // Pencil check/click type sound
        volume: 0.5,
    }),
    pop: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], // Pop sound
        volume: 0.5,
    }),
    success: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'], // Success chime
        volume: 0.4,
    }),
    shake: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3'], // Shaking sound/Rattle
        volume: 0.5,
        rate: 1.5
    }),
    paper: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2414/2414-preview.mp3'], // Paper crumble/turn
        volume: 0.3,
    })
};

export const playSound = (key) => {
    if (sounds[key]) {
        sounds[key].play();
    }
};

export default sounds;
