"use client";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { signIn } from "next-auth/react"; // asegúrate de tener esto
import Link from "next/link";
import Image from "next/image";
import "public/styles/landing.css";
export const dynamic = "force-dynamic";
export default function Landing() {
  const [isMounted, setIsMounted] = useState(false);
 
  const navRef = useRef(null);
  const heroRef = useRef(null);

  const { t } = useTranslation();

  useEffect(() => {
    const nav = document.getElementById("navegador");
    
    function initObserver() {
      
      if (nav && heroRef.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (!nav) return;

            if (!entry.isIntersecting) {
              nav.classList.remove("bg-transparent");
              nav.classList.add("bg-gray-900");
            } else {
              nav.classList.remove("bg-gray-900");
              nav.classList.add("bg-transparent");
            }
          },
          { root: null, threshold: 0.1 }
        );

        observer.observe(heroRef.current);
        return () => observer.disconnect();
      }
    }

    initObserver();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null
  return (
    
    <main className="min-h-screen bg-white text-gray-900">
      {/* HERO */}
      <section ref={heroRef} className="hero" id="hero">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src="/file.mp4" type="video/mp4" />
        </video>        
        <Image src="/hero-movile.jpeg" className="hero-mobile" alt="hero" widt={heroRef.current.width} height={heroRef.current.height} />
        <div className="hero-text">
          <h1>{t("hero.title")}</h1>
          <p>{t("hero.description")}</p>
          <button type="button" id="hero-btn-mobile" onClick={() => signIn(undefined, { callbackUrl: "/" })}>{t("hero.btn")}</button>
          <button
            id="hero-btn"
            className="cta-button"
            onClick={() => signIn(undefined, { callbackUrl: "/" })}
          >
            {t("hero.btn")}
          </button>
        </div>
      </section>
      
      {/* STACKING CARDS Mobile */}
      <section className="carousel-mobile-container" id="carru">
        <div className="carousel-mobile-heading">
          <h3>{t("stack.validate")}</h3>
          <p>{t("stack.validateSubtitle")}</p>
        </div>
        <div className="carousel-mobile-cards" id="mobileCarousel">
         
            <div key={1} className={`carousel-card card-1`}>
              <h5>01</h5>
              <p>{t("stack.steps.0")}</p>
            </div>
            <div key={2} className={`carousel-card card-2`}>
              <h5>02</h5>
              <p>{t("stack.steps.1")}</p>
            </div>
            <div key={3} className={`carousel-card card-3`}>
              <h5>03</h5>
              <p>{t("stack.steps.2")}</p>
            </div>
            <div key={4} className={`carousel-card card-4`}>
              <h5>04</h5>
              <p>{t("stack.steps.3")}</p>
            </div>
         
        </div>
        <div className="carousel-indicators" id="carouselIndicators">
         
            <div key={1} className={`dot "active"`}></div>
            <div key={2} className={`dot`}></div>
            <div key={3} className={`dot`}></div>
            <div key={4} className={`dot`}></div>
          
        </div>
      </section>

      {/* STACK Desktop */}
      <section className="stack-section" id="stack">
        <div className="left-text">
          <h3>{t("stack.validate")}</h3>
          <p>{t("stack.validateSubtitle")}</p>
        </div>
        <div className="stack-container">
          
            <div key={1} className="card">
              <div className={`tarjeta card-1`}>
                <div className="superior">{`01`}</div>
                <div className="inferior">{t("stack.steps.0")}</div>
              </div>
            </div>
            <div key={2} className="card">
              <div className={`tarjeta card-2`}>
                <div className="superior">{`02`}</div>
                <div className="inferior">{t("stack.steps.1")}</div>
              </div>
            </div>
            <div key={3} className="card">
              <div className={`tarjeta card-3`}>
                <div className="superior">{`03`}</div>
                <div className="inferior">{t("stack.steps.2")}</div>
              </div>
            </div>
            <div key={4} className="card">
              <div className={`tarjeta card-4`}>
                <div className="superior">{`04`}</div>
                <div className="inferior">{t("stack.steps.3")}</div>
              </div>
            </div>
        </div>
      </section>

      {/* EXTRA */}
      <section className="extra-section-image">
        <div className="row">
          <div
            className="text-col"
            dangerouslySetInnerHTML={{ __html: t("extra.title") }}
          />
          <div className="image-col relative w-full h-full" id="img-col">
            <Image
              src="/quiz.gif"
              alt="quiz.gif"
              fill
              className="object-contain" 
              priority={false}
            />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <h5>{t("about.title")}</h5>
        <h2 className="texto-gris">{t("about.description")}</h2>
        <ul>          
            <li key={1}>{t("about.bullets.0")}</li>
            <li key={2}>{t("about.bullets.1")}</li>
            <li key={3}>{t("about.bullets.2")}</li>
            <li key={4}>{t("about.bullets.3")}</li>
        </ul>
        <button>
          <span>{t("about.readMore")}</span>
        </button>
      </section>

      {/* PERFILA */}
      <section className="perfila-section" id="somos">
        <div className="perfila-text">
          <h5>{t("perfila.title")}</h5>
          <h2>{t("perfila.subtitle")}</h2>
          
            <div key={1}>
              <h3>
                <span className="step-number">{`01`}</span> {t("perfila.titulos.0")}
              </h3>
              <p>
                <strong>{t("perfila.subtitulos.0")}</strong>
              </p>
              <p>{t("perfila.descripciones.0")}</p>
            </div>
            <div key={2}>
              <h3>
                <span className="step-number">{`02`}</span> {t("perfila.titulos.1")}
              </h3>
              <p>
                <strong>{t("perfila.subtitulos.1")}</strong>
              </p>
              <p>{t("perfila.descripciones.1")}</p>
            </div>
            
            <div key={3}>
              <h3>
                <span className="step-number">{`03`}</span> {t("perfila.titulos.2")}
              </h3>
              <p>
                <strong>{t("perfila.subtitulos.2")}</strong>
              </p>
              <p>{t("perfila.descripciones.2")}</p>
            </div>
            
            <div key={4}>
              <h3>
                <span className="step-number">{`04`}</span> {t("perfila.titulos.3")}
              </h3>
              <p>
                <strong>{t("perfila.subtitulos.3")}</strong>
              </p>
              <p>{t("perfila.descripciones.3")}</p>
            </div>
        </div>
        <div className="perfila-image">
          <div id="header-movil">{t("perfila.headerimage")}</div>
          <Image fill loading="lazy" src="page.gif" alt="page.gif" />
        </div>
      </section>

      {/* PLANES */}
      <section className="pricing-section" id="pricing">
        <h2>{t("planes.title")}</h2>
        <div className="row pricing-cards">
         
            <div key={1} className="col pricing-card">
              <h3>{t("planes.list.0.titulo")}</h3>
              <p>
                <strong>{t("planes.list.0.subtitulo")}</strong>
              </p>
              <p>{t("planes.list.0.descripcion")}</p>
              <ul>
                <li key={1}>{t("planes.list.0.bullets.0")}</li>
                <li key={2}>{t("planes.list.0.bullets.1")}</li>
                <li key={3}>{t("planes.list.0.bullets.2")}</li>
                <li key={4}>{t("planes.list.0.bullets.3")}</li>                
              </ul>
              <div className="price">{t("planes.list.0.precio")}</div>
            </div>
            
             <div key={2} className="col pricing-card">
              <h3>{t("planes.list.1.titulo")}</h3>
              <p>
                <strong>{t("planes.list.1.subtitulo")}</strong>
              </p>
              <p>{t("planes.list.1.descripcion")}</p>
              <ul>
                <li key={1}>{t("planes.list.1.bullets.0")}</li>
                <li key={2}>{t("planes.list.1.bullets.1")}</li>
                <li key={3}>{t("planes.list.1.bullets.2")}</li>
                <li key={4}>{t("planes.list.1.bullets.3")}</li>                
              </ul>
              <div className="price">{t("planes.list.1.precio")}</div>
            </div>

            <div key={3} className="col pricing-card">
              <h3>{t("planes.list.2.titulo")}</h3>
              <p>
                <strong>{t("planes.list.2.subtitulo")}</strong>
              </p>
              <p>{t("planes.list.2.descripcion")}</p>
              <ul>
                <li key={1}>{t("planes.list.2.bullets.0")}</li>
                <li key={2}>{t("planes.list.2.bullets.1")}</li>
                <li key={3}>{t("planes.list.2.bullets.2")}</li>
                <li key={4}>{t("planes.list.2.bullets.3")}</li>                
              </ul>
              <div className="price">{t("planes.list.2.precio")}</div>
            </div>

            
        </div>
      </section>

      {/* READY */}
      <section className="ready-section" id="ready">
        <div className="container-fluid ready-text">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <h2>{t("ready.left")}</h2>
            </div>
            <div className="col-12 col-md-6">
              <p>{t("ready.right")}</p>
              <button className="ready-btn">
                <h6>{t("ready.button")}</h6>
                <span>&#x2192;</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      <a  className="floating-btn" onClick={() => signIn(undefined, { callbackUrl: "/" })}>
        Get Started
      </a>
      {/* MODAL idioma */}
      {/* MODAL idioma (Bootstrap) */}
      <div className="modal fade" id="languageModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content bg-white d-flex justify-content-center align-items-center text-center position-relative">
            <button type="button" className="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close"></button>
            <div>
              <h2 className="mb-4">Selecciona idioma</h2>
              <button className="btn btn-link fs-4 d-block" onClick={() => handleLanguageChange("es")}>Español</button>
              <button className="btn btn-link fs-4 d-block" onClick={() => handleLanguageChange("en")}>English</button>
              <button className="btn btn-link fs-4 d-block" onClick={() => handleLanguageChange("fr")}>Français</button>
            </div>
          </div>
        </div>
      </div>
    </main>
      
  );
}
