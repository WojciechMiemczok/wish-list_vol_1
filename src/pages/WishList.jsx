import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HiXMark } from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";




export default function WishList({ session }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false }); // Sortowanie od najnowszych

    if (error) {
      console.error('Błąd pobierania:', error);
    } else {
      setProducts(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

try {
  let finalImageUrl = null;

  // 1. Priorytet: Wgrany plik z dysku
  if (imageFile) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${session.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
      
    finalImageUrl = data.publicUrl;
  } 
  // 2. Alternatywa: Zewnętrzny link z internetu
  else if (imageUrlInput) {
    finalImageUrl = imageUrlInput;
  }

  // 3. Zapis do bazy 
  const { error: dbError } = await supabase
    .from('products')
    .insert([
      {
        user_id: session.user.id,
        name,
        price: parseFloat(price) || 0,
        description,
        link,
        category,
        image_url: finalImageUrl // Używamy zmiennej określonej wyżej
      }
    ]);

      if (dbError) throw dbError;

      // Sukces - czyścimy formularz
        setName('');
        setPrice('');
        setDescription('');
        setLink('');
        setCategory('');
        setImageFile(null);
        setImageUrlInput(''); // Czyszczenie linku do zdjęcia
        
        fetchProducts(); // Odświeżamy listę
      
    } catch (error) {
      alert('Wystąpił błąd: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    // Okienko z prośbą o potwierdzenie
    if (!window.confirm('Czy na pewno chcesz usunąć ten produkt?')) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id); // Szukamy produktu po jego unikalnym ID

    if (error) {
      alert('Błąd podczas usuwania: ' + error.message);
    } else {
      // Aktualizujemy listę na ekranie, odfiltrowując usunięty produkt
      setProducts(products.filter((product) => product.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r md:p-8">

      {/* Kontener całej aplikacji */}
      <div className="mx-auto max-w-7xl pt-[40px] lg:pt-[20px] lg:rounded-[30px] lg:mt-[10px] md:mt-0 p-0 md:p-6 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
        <div className="mb-8 flex ml-[15px] mr-[15px] md:ml-0 md:mr-0  items-center justify-between">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-800">Moja Lista</h1>
          <button
            onClick={handleLogout}
            className="rounded-[10px] bg-red-500 px-2 py-2 text-white hover:bg-red-400 transition-colors duration-300"
          >
            Wyloguj się
          </button>
        </div>
        <div>
      {/* Przycisk otwierający */}
      <button className='hidden md:flex justify-center items-center bg-blue-400 w-[200px] text-white h-[50px] rounded-2xl text-[20px] mb-[20px] text-center hover:bg-blue-300 transition-colors duration-300' onClick={() => setIsOpen(true)}>
        Dodaj do listy
      </button>

      {/* Ukryty / widoczny div */}

<AnimatePresence>
  {isOpen && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => setIsOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl"
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="mb-2 ml-auto block"
        >
          <HiXMark className="text-gray-100 text-[40px] hover:text-red-400 transition-colors" />
        </button>

        <form
          onSubmit={handleAddProduct}
          className="grid gap-4 rounded-2xl bg-gray-100 p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          <h2 className="text-xl font-semibold">
            Dodaj nowy produkt
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Nazwa produktu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-md border p-2"
            />

            <input
              type="number"
              step="0.01"
              placeholder="Cena (opcjonalnie)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-md border p-2"
            />
          </div>

          <input
            type="url"
            placeholder="Link do sklepu (opcjonalnie)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="rounded-md border p-2"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Kategoria (np. Elektronika, Ubrania)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border p-2"
            />

            <textarea
              placeholder="Opis / Notatki (opcjonalnie)"
              maxLength={100}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-md border p-2"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">
                Dodaj z dysku:
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                disabled={!!imageUrlInput}
                className="rounded-md border p-1 text-sm bg-white file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">
                LUB wklej link do obrazka:
              </label>

              <input
                type="url"
                placeholder="https://..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                disabled={!!imageFile}
                className="rounded-md border p-2 text-sm disabled:bg-gray-100 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Dodawanie..." : "Dodaj produkt"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>

        {/* Lista produktów kontener zawierający każdy produkt*/}
        <div className='flex-col'>
          <h2 className="mb-4 text-xl ml-[15px] md:ml-0 font-semibold">Twoje produkty ({products.length})</h2>
          
          {isLoading ? (
            <p className="text-gray-500">Ładowanie produktów...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">Lista jest pusta. Dodaj swój pierwszy produkt!</p>
          ) : (
            
<div className="flex flex-col w-full gap-[20px]">
  <AnimatePresence mode="popLayout">
    {products.map((product) => (
      <motion.div
        key={product.id}
        layout
        initial={{
          opacity: 0.4,
          scale: 0.4
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        exit={{
          opacity: 0,
          scale: 0.95
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut",
          layout: {
            duration: 0.35
          }
        }}
        className="flex h-[280px] w-full overflow-hidden md:rounded-[30px] rounded-[10px] md:border-[3px] shadow-[0_0_7px_rgba(0,0,0,0.3)] md:shadow-[0] bg-white border-[rgba(20,189,255,0.35)] hover:shadow-[0_0_20px_rgba(96,165,250,0.6)] transition-shadow duration-300 ease-in-out"
      >

        {/* Kontener na zdjęcie */}
        <div className="p-3 m-4 rounded-2xl bg-gray-200 w-[150px] md:w-[300px] shrink-0 flex justify-center items-center">

          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              src="https://x13.pl/img/cms/blog/zmiana-zdjecia/nowe_zdjecie.jpg"
              alt="Brak zdjęcia"
              className="h-full w-full object-contain"
            />
          )}

        </div>

        {/* Kontener z informacjami */}
        <div className="flex-1 min-w-0 p-4 flex flex-col">

          {/* Nazwa */}
          <h3 className="break-words lg:text-4xl mb-2 lg:mb-3 text-xl font-bold text-gray-800">
            {product.name}
          </h3>

          {/* Kategoria */}
          {product.category && (
            <div className="mb-2 w-fit rounded-full bg-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-500">
              {product.category}
            </div>
          )}

          {/* Cena */}
          {product.price > 0 && (
            <p className="text-2xl font-semibold text-green-600">
              {product.price} zł
            </p>
          )}

          {/* Opis */}
          {product.description && (
            <p className="break-words mt-2 lg:text-lg text-sm text-gray-600">
              {product.description}
            </p>
          )}

          {/* Przyciski */}
          <div className="mt-auto flex items-center justify-between pb-4">

            <button
              onClick={() => handleDeleteProduct(product.id)}
              className="rounded text-sm lg:text-xl font-medium text-red-500 hover:text-red-400 transition-colors duration-300"
            >
              Usuń
            </button>

            {product.link ? (
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm lg:text-2xl font-medium text-blue-600 hover:text-blue-400 transition-colors duration-300"
              >
                Do sklepu &rarr;
              </a>
            ) : (
              <p className="text-sm font-medium lg:text-2xl text-gray-600">
                Do sklepu &rarr;
              </p>
            )}

          </div>
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
</div>

          )}
        </div>
      </div>
    </div>
  );
}



/* {product.price > 0 && (
                      <p className="text-lg font-semibold text-green-600">{product.price} PLN</p>
                    )} */