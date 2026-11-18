import { gsap } from './gsap';

/*
Scrubs through a sequence of images, drawing the current one to a <canvas>.
Config: urls, canvas, scrollTrigger, clear, paused, fps, onUpdate(index, image).
Returns a Tween instance.
*/
export function imageSequence(config) {
  let playhead = { frame: 0 },
    canvas = gsap.utils.toArray(config.canvas)[0] || console.warn('canvas not defined'),
    ctx = canvas.getContext('2d'),
    curFrame = -1,
    onUpdate = config.onUpdate,
    images,
    updateImage = function () {
      let frame = Math.round(playhead.frame);
      if (frame !== curFrame) {
        config.clear && ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[Math.round(playhead.frame)], 0, 0);
        curFrame = frame;
        onUpdate && onUpdate.call(this, frame, images[frame]);
      }
    };
  images = config.urls.map((url, i) => {
    let img = new Image();
    img.src = url;
    i || (img.onload = updateImage);
    return img;
  });
  return gsap.to(playhead, {
    frame: images.length - 1,
    ease: 'none',
    onUpdate: updateImage,
    duration: images.length / (config.fps || 30),
    paused: !!config.paused,
    scrollTrigger: config.scrollTrigger,
  });
}
