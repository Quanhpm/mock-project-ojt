import React from 'react'
import Cart from '../../cart/pages/Cart';
import { useState } from 'react'

interface CardInfo {
  imageSrc: string;
  name: string;
  price: string;
}

function HomePage() {
  const [card, setCard] = useState<CardInfo>({
    imageSrc: "https://img.freepik.com/free-photo/latte-coffee_1122-2728.jpg",
    name: "Product Name",
    price: "100000"
  });

  return (
    <div className="bg-gray-50">
      <section className="relative h-[500px] w-full overflow-hidden flex items-center justify-end">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2070")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/40 shadow-inner"></div>
        </div>

        <div className="relative z-10 w-full max-w-2xl px-8 md:px-16 text-right text-white">
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl drop-shadow-lg">
            Welcome to our Coffee Shop
          </h1>
          <p className="mb-8 text-lg font-light opacity-90 md:text-xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat nostrum commodi nesciunt accusamus voluptas eaque praesentium expedita, exercitationem vel dolor illo incidunt, ducimus sunt fuga. Natus non ipsa mollitia illo!
          </p>
          <button className="rounded-full bg-primary px-8 py-3 font-semibold transition-all hover:bg-secondary hover:scale-105 active:scale-95 shadow-lg">
            Shop Now
          </button>
        </div>
      </section>

      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 uppercase tracking-tighter text-orange-900">
          Discover menu
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
          <div className="space-y-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-6">
                <img
                  src="https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=200"
                  alt="menu"
                  className="w-24 h-24 rounded-full object-cover border-2 border-orange-200 shadow-md flex-shrink-0"
                />
                <div>
                  <p className="text-xl font-bold text-gray-800 mb-1">Espresso Coffee</p>
                  <p className="text-sm text-gray-600 line-clamp-2 italic">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Modi alias itaque excepturi autem voluptatem.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            {[4, 5, 6].map((item) => (
              <div key={item} className="flex items-center gap-6">
                <img
                  src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200"
                  alt="menu"
                  className="w-24 h-24 rounded-full object-cover border-2 border-orange-200 shadow-md flex-shrink-0"
                />
                <div>
                  <p className="text-xl font-bold text-gray-800 mb-1">Latte Macchiato</p>
                  <p className="text-sm text-gray-600 line-clamp-2 italic">
                    Modi alias itaque excepturi autem voluptatem doloribus error deserunt. Est ipsam molestias aperiam.
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="py-16 px-4 md:px-16 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">Best Seller</h2>
          <div className="h-1 w-20 bg-orange-600 mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Cart imageSrc={card.imageSrc} name={card.name} price={card.price} />
          <Cart imageSrc={card.imageSrc} name={card.name} price={card.price} />
          <Cart imageSrc={card.imageSrc} name={card.name} price={card.price} />
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-primary mb-16">Title</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-dark mb-3">Icon</h3>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae at perspiciatis dolores provident earum necessitatibus nulla perferendis atque maxime nobis sapiente, hic dignissimos ab! Nesciunt expedita molestias dolorem necessitatibus vero!
              </p>
            </div>
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-dark mb-3">Icon</h3>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae at perspiciatis dolores provident earum necessitatibus nulla perferendis atque maxime nobis sapiente, hic dignissimos ab! Nesciunt expedita molestias dolorem necessitatibus vero!
              </p>  
            </div>
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-dark mb-3">Icon</h3>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae at perspiciatis dolores provident earum necessitatibus nulla perferendis atque maxime nobis sapiente, hic dignissimos ab! Nesciunt expedita molestias dolorem necessitatibus vero!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative py-24 px-8 text-center text-white bg-fixed bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1961")'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl font-serif italic mb-6">Our Special Story</h2>
          <p className="text-lg leading-relaxed font-light italic opacity-90">
            "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Explicabo quidem,
            eligendi nobis dignissimos dolorem exercitationem perferendis. Dolorum necessitatibus,
            repellendus maxime iusto porro ducimus natus adipisci? Ullam magnam voluptatibus excepturi reiciendis!"
          </p>
          <button className="mt-8 border-2 border-white px-6 py-2 hover:bg-white hover:text-black transition-colors">
            Read More
          </button>
        </div>
      </section>
    </div>
  )
}

export default HomePage