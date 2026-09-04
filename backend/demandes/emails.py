import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def _get_base_email_template(title: str, preheader: str, content_html: str, action_url: str = None, action_text: str = None) -> str:
    """Génère un template email HTML moderne aux couleurs de DemOps (#002B7F et #FF5E00)."""
    action_button_html = ""
    if action_url and action_text:
        action_button_html = f"""
        <div style="text-align: center; margin: 30px 0;">
            <a href="{action_url}" style="background-color: #FF5E00; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(255, 94, 0, 0.25);">
                {action_text} &rarr;
            </a>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F7FB; margin: 0; padding: 30px 10px; color: #071530;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 4px 24px rgba(0, 43, 127, 0.04);">
            <!-- En-tête -->
            <div style="background-color: #002B7F; padding: 24px 32px; text-align: left;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">
                  Dem<span style="color: #FF5E00;">Ops</span>
                </h1>
                <p style="color: #B3D1FF; margin: 4px 0 0 0; font-size: 12px; font-weight: 500;">Système de Gestion des Demandes d'Intervention</p>
            </div>

            <!-- Contenu -->
            <div style="padding: 32px;">
                <h2 style="color: #002B7F; font-size: 18px; font-weight: 800; margin-top: 0;">{title}</h2>
                <div style="font-size: 14px; line-height: 1.6; color: #1E293B;">
                    {content_html}
                </div>
                {action_button_html}
            </div>

            <!-- Pied de page -->
            <div style="background-color: #F8FAFC; padding: 20px 32px; border-top: 1px solid #F1F5F9; font-size: 11px; color: #64748B; text-align: center;">
                <p style="margin: 0;">Ce message automatique vous a été envoyé par la plateforme interne <strong>DemOps</strong>.</p>
                <p style="margin: 4px 0 0 0;">Merci de ne pas répondre directement à cet email.</p>
            </div>
        </div>
    </body>
    </html>
    """

def send_demande_created_email(demande):
    """Envoie un accusé de réception par email au demandeur."""
    if not demande.demandeur or not demande.demandeur.email:
        return

    subject = f"[{demande.reference or 'DEM'}] Confirmation de votre demande : {demande.objet}"
    
    content_html = f"""
    <p>Bonjour <strong>{demande.demandeur.get_full_name() or demande.demandeur.username}</strong>,</p>
    <p>Votre demande d'intervention a bien été enregistrée avec succès sous la référence <strong>{demande.reference}</strong>.</p>
    
    <div style="background-color: #F4F7FB; border-radius: 16px; padding: 16px; margin: 20px 0; border: 1px solid #E2ECFC;">
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Objet :</strong> {demande.objet}</p>
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Catégorie :</strong> {demande.categorie.libelle if demande.categorie else 'Générale'}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Niveau d'urgence :</strong> <span style="text-transform: capitalize; font-weight: bold; color: {'#E05200' if demande.urgence == 'eleve' else '#002B7F'};">{demande.urgence}</span></p>
    </div>
    
    <p>Nos équipes techniques vont traiter votre requête dans les meilleurs délais. Vous recevrez une notification dès sa prise en charge.</p>
    """

    try:
        html_message = _get_base_email_template(
            title="Votre demande a été prise en compte",
            preheader="Accusé de réception de votre ticket",
            content_html=content_html,
            action_text="Suivre ma demande",
            action_url="http://localhost:3000/demandes"
        )
        send_mail(
            subject=subject,
            message=f"Votre demande {demande.reference} a bien été enregistrée.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[demande.demandeur.email],
            html_message=html_message,
            fail_silently=True
        )
        logger.info(f"Email de création envoyé pour {demande.reference}")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi d'email de création pour {demande.reference}: {e}")

def send_urgent_alert_email(demande, techniciens_emails):
    """Envoie une alerte prioritaire aux techniciens pour les tickets d'urgence élevée."""
    if not techniciens_emails:
        return

    subject = f" [URGENT] Nouvelle intervention requise : {demande.reference} - {demande.objet}"
    
    content_html = f"""
    <p style="color: #E05200; font-weight: bold;">Une nouvelle demande marquée comme URGENTE nécessite une intervention rapide.</p>
    
    <div style="background-color: #FFF5F0; border-radius: 16px; padding: 16px; margin: 20px 0; border: 1px solid #FFD1B3;">
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Référence :</strong> {demande.reference}</p>
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Demandeur :</strong> {demande.demandeur.get_full_name() or demande.demandeur.username} ({demande.demandeur.departement or 'Service non précisé'})</p>
        <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Objet :</strong> {demande.objet}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Description :</strong> {demande.description}</p>
    </div>
    
    <p>Merci de vous rendre sur l'espace d'intervention pour prendre en charge ce ticket sans délai.</p>
    """

    try:
        html_message = _get_base_email_template(
            title="Alerte Intervention Prioritaire",
            preheader="Demande urgente en attente",
            content_html=content_html,
            action_text="Prendre en charge l'intervention",
            action_url="http://localhost:3000/interventions"
        )
        send_mail(
            subject=subject,
            message=f"Demande urgente {demande.reference} créée par {demande.demandeur}.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=techniciens_emails,
            html_message=html_message,
            fail_silently=True
        )
        logger.info(f"Email d'alerte urgente envoyé pour {demande.reference}")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'alerte urgente pour {demande.reference}: {e}")

def send_demande_assigned_email(demande):
    """Notifie le demandeur que sa demande a été prise en charge par un technicien."""
    if not demande.demandeur or not demande.demandeur.email:
        return

    tech_name = demande.technicien.get_full_name() if demande.technicien else "Un intervenant technique"
    subject = f"[{demande.reference}] Prise en charge de votre demande par {tech_name}"
    
    content_html = f"""
    <p>Bonjour <strong>{demande.demandeur.get_full_name() or demande.demandeur.username}</strong>,</p>
    <p>Votre demande d'intervention <strong>{demande.reference}</strong> (<em>{demande.objet}</em>) a été prise en charge par <strong>{tech_name}</strong>.</p>
    <p>L'intervention est actuellement en cours de traitement. Vous serez informé dès sa résolution.</p>
    """

    try:
        html_message = _get_base_email_template(
            title="Intervention en cours de traitement",
            preheader="Votre demande a été prise en charge",
            content_html=content_html,
            action_text="Consulter le dossier",
            action_url=f"http://localhost:3000/demandes/{demande.id}"
        )
        send_mail(
            subject=subject,
            message=f"Votre demande {demande.reference} est prise en charge par {tech_name}.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[demande.demandeur.email],
            html_message=html_message,
            fail_silently=True
        )
        logger.info(f"Email d'assignation envoyé pour {demande.reference}")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email d'assignation pour {demande.reference}: {e}")

def send_demande_resolved_email(demande):
    """Notifie le demandeur que sa demande est résolue et l'invite à confirmer la clôture."""
    if not demande.demandeur or not demande.demandeur.email:
        return

    subject = f"[{demande.reference}] Votre demande a été résolue !"
    
    content_html = f"""
    <p>Bonjour <strong>{demande.demandeur.get_full_name() or demande.demandeur.username}</strong>,</p>
    <p>Nous avons le plaisir de vous informer que votre demande <strong>{demande.reference}</strong> (<em>{demande.objet}</em>) a été marquée comme <strong>Résolue</strong> par le service technique.</p>
    <p>Merci de vous rendre sur votre espace pour tester et confirmer la bonne clôture de votre demande, ou la rouvrir si le problème persiste.</p>
    """

    try:
        html_message = _get_base_email_template(
            title="Intervention Terminée",
            preheader="Votre demande est résolue",
            content_html=content_html,
            action_text="Consulter et Valider la clôture",
            action_url=f"http://localhost:3000/demandes/{demande.id}"
        )
        send_mail(
            subject=subject,
            message=f"Votre demande {demande.reference} est résolue. Rendez-vous sur la plateforme pour confirmer la clôture.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[demande.demandeur.email],
            html_message=html_message,
            fail_silently=True
        )
        logger.info(f"Email de résolution envoyé pour {demande.reference}")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email de résolution pour {demande.reference}: {e}")

def send_commentaire_email(commentaire):
    """Notifie l'autre partie lorsqu'un nouveau message est posté dans le journal d'intervention."""
    demande = commentaire.demande
    auteur = commentaire.auteur
    
    # Si l'auteur est le technicien, notifier le demandeur
    # Si l'auteur est le demandeur, notifier le technicien assigné
    destinataire = None
    if auteur == demande.demandeur:
        destinataire = demande.technicien
    else:
        destinataire = demande.demandeur

    if not destinataire or not destinataire.email:
        return

    auteur_nom = auteur.get_full_name() or auteur.username
    subject = f"[{demande.reference}] Nouveau message de {auteur_nom}"

    content_html = f"""
    <p>Bonjour <strong>{destinataire.get_full_name() or destinataire.username}</strong>,</p>
    <p><strong>{auteur_nom}</strong> a posté un nouveau message concernant le dossier <strong>{demande.reference}</strong> (<em>{demande.objet}</em>) :</p>
    
    <div style="background-color: #F4F7FB; border-left: 4px solid #002B7F; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #071530; white-space: pre-wrap;">{commentaire.contenu}</p>
    </div>
    """

    try:
        html_message = _get_base_email_template(
            title="Nouveau message sur votre dossier",
            preheader=f"Message de {auteur_nom}",
            content_html=content_html,
            action_text="Répondre sur la plateforme",
            action_url=f"http://localhost:3000/demandes/{demande.id}" if destinataire.role == 'demandeur' else f"http://localhost:3000/interventions/{demande.id}"
        )
        send_mail(
            subject=subject,
            message=f"Nouveau message de {auteur_nom} sur le dossier {demande.reference} : {commentaire.contenu}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[destinataire.email],
            html_message=html_message,
            fail_silently=True
        )
        logger.info(f"Email de commentaire envoyé pour {demande.reference} à {destinataire.email}")
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email de commentaire pour {demande.reference}: {e}")

