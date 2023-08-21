import Second from '@/components/Second';
import Third from '@/components/Third';
import React, { useState, useEffect } from 'react';

function ImageSlider() {
  const [currentItem, setCurrentItem] = useState(0);
  const items = [
    { type: 'video', url: 'https://storage.thedematerialised.com/257da9f4-f690-405f-89c2-501721414c6a/imageUrls/pixel_boots_cover_v2.mp4', bgColor: '#FFFFFF' },
    { type: 'image', url: 'https://static.dezeen.com/uploads/2021/04/the-fabricant-rtfkt-renaixance-digital-fashion-design_dezeen.gif', bgColor: '' },
    { type: 'video', url: 'https://storage.thedematerialised.com/drop4/soulland_penelope_catwalk.mp4', bgColor: '#FFFFFF' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItem((prevItem) => (prevItem + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderItem = () => {
    const item = items[currentItem];

    if (item.type === 'image') {
      return (
        <img src={item.url} alt="hero image" />
      );
    } else if (item.type === 'video') {
      return (
        <video src={item.url} autoPlay loop muted playsInline>
          Sorry, your browser does not support embedded videos.
        </video>
      );
    }
  };

  return (
    <section>
      <div className="grid w-3/4 px-10 pt-6 pb-6 mx-auto lg:gap-8 xl:gap-0 lg:py-12 lg:grid-cols-12 lg:pt-8 space-x-8 rounded-lg">
        <div className="mr-auto place-self-center lg:col-span-6">
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white font-sans">
            Unlocking Boundless Style <br />
            <span className="max-w-2xl mb-4 text-4xl text-transparent bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text">
              in NFTWorld!
            </span>
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
            The Largest Blockchain Virtual Fashion Company, Pioneering the Future with NFTs, AI, and Linea Technology!
          </p>
          <button className="max-w-2xl mb-4 text-2xl bg-gradient-to-r from-pink-500 to-blue-500 text-white px-4 py-2 rounded-lg">
            Discover
          </button>
        </div>

        <div className="hidden lg:mt-10 lg:col-span-6 lg:flex">
          {renderItem()}
        </div>
      </div>
      <Second/>
      <Third />
    </section>
  );
}

export default ImageSlider;
