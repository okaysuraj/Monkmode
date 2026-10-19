// Image dimensions reserve space before lazy artwork loads.
const images = {
  wall: {
    src: '/secret-pathways-assets/foreground/png/temple-wall.webp',
    width: 1536,
    height: 884,
  },
  pine: {
    src: '/secret-pathways-assets/foreground/png/pine-tree.webp',
    width: 1024,
    height: 1438,
  },
  grass: {
    src: '/secret-pathways-assets/foreground/png/tall-grass.webp',
    width: 1717,
    height: 916,
  },
  sakura: {
    src: '/secret-pathways-assets/foreground/png/sakura-branch.webp',
    width: 1536,
    height: 1024,
  },
  leaves: {
    src: '/secret-pathways-assets/foreground/png/maple-leaves.webp',
    width: 1536,
    height: 1024,
  },
  lantern: {
    src: '/secret-pathways-assets/foreground/png/stone-lantern.webp',
    width: 1024,
    height: 1499,
  },
  bush: {
    src: '/secret-pathways-assets/foreground/png/garden-bush.webp',
    width: 1717,
    height: 876,
  },
  stones: {
    src: '/secret-pathways-assets/foreground/png/basalt-stones.webp',
    width: 1536,
    height: 996,
  },
  hill: {
    src: '/secret-pathways-assets/foreground/png/hill.webp',
    width: 1774,
    height: 887,
  },
  ruins: {
    src: '/secret-pathways-assets/foreground/png/shrine-ruins.webp',
    width: 1536,
    height: 1001,
  },
};

// Each chapter controls which artwork enters and from which edge.
const layersByChapter = {
  gate: [
    {
      image: 'wall',
      enter: 'left',
    },
    {
      image: 'pine',
      enter: 'right',
    },
    {
      image: 'grass',
      enter: 'up',
    },
  ],
  pathways: [
    {
      image: 'sakura',
      enter: 'left',
      modifier: 'fg-el--sway',
    },
    {
      image: 'leaves',
      enter: 'right',
      modifier: 'fg-el--sway',
    },
    {
      image: 'lantern',
      enter: 'up',
    },
    {
      image: 'bush',
      enter: 'up',
    },
  ],
  lessons: [
    {
      image: 'wall',
      enter: 'right',
      modifier: 'fg-el--flip',
    },
    {
      image: 'stones',
      enter: 'up',
    },
    {
      image: 'grass',
      enter: 'up',
    },
  ],
  eternity: [
    {
      image: 'hill',
      enter: 'up',
    },
    {
      image: 'ruins',
      enter: 'left',
    },
    {
      image: 'grass',
      enter: 'up',
    },
    {
      image: 'sakura',
      enter: 'left',
    },
  ],
  foot: [
    {
      image: 'bush',
      enter: 'up',
    },
    {
      image: 'grass',
      enter: 'up',
    },
    {
      image: 'stones',
      enter: 'up',
    },
  ],
};

export default function Foreground({ chapter }) {
  return (
    <div className="fg" data-fg={chapter} aria-hidden="true">
      {layersByChapter[chapter].map(({ image, enter, modifier = '' }) => (
        <span key={image} className={`fg-el fg-${image} ${modifier}`} data-fg-in={enter}>
          <img {...images[image]} alt="" loading="lazy" decoding="async" />
        </span>
      ))}
    </div>
  );
}
