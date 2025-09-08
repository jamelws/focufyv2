import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function Footer() {
    const { t } = useTranslation();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Aquí puedes añadir la lógica para manejar el envío del formulario
        alert("Formulario enviado (lógica pendiente).");
    }

    return (
        <footer className="footer">
            <div className="newsletter">
                <Image src="/focu_whitw_02.png" alt="Focufy" width={140} height={50} priority />
            </div>
            <div className="footer-columns">
                <div className="footer-column">
                    <p>{t('footer.join_newsletter')}</p>
                    <form onSubmit={handleFormSubmit}>
                        <div className="form-group">
                            <input type="email" id="email" placeholder=" " required />
                            <label htmlFor="email">Email *</label>
                        </div>
                        <div className="newsletter-options">
                            <label>
                                <input type="checkbox" />
                                {t('footer.subscribe_yes')}
                            </label>
                            <button type="submit">{t('footer.submit')}</button>
                        </div>
                    </form>
                </div>
                <div className="footer-column">
                    <h6>{t('footer.quick_links')}</h6>
                    <ul>
                        <li><a href="#hero">{t('footer.home')}</a></li>
                        <li><a href="#about">{t('footer.about')}</a></li>
                        <li><a href="#somos">{t('footer.solutions')}</a></li>
                        <li><a href="#ready">{t('footer.contact')}</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h6>{t('footer.social')}</h6>
                    <ul>
                        <li>LinkedIn</li>
                        <li>Facebook</li>
                        <li>Instagram</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h6>{t('footer.contact_info')}</h6>
                    <p>info@mysite.com<br />123-456-7890<br />San Francisco, CA</p>
                </div>
                <div className="footer-column">
                    <h6>{t('footer.policy')}</h6>
                    <ul>
                        <li>{t('footer.terms')}</li>
                        <li>{t('footer.privacy')}</li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
