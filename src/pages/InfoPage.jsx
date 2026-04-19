import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { ArrowLeft, FileText, DollarSign, Heart, Shield, FileCheck, HelpCircle } from 'lucide-react';

const PAGES = {
  jatekszabalyok: {
    icon: FileText,
    color: '#f59e0b',
    bg: '#fef3c7',
    title: 'Játékszabályok',
    badge: 'Szabályzat',
    sections: [
      {
        title: 'Üdvözöljük a Fortuna Lottón!',
        content: `Magyarországon elérhető online lottó platformunkon különféle számsorsjátékokat játszhat, ahol saját számokat választhat, vagy gépi (véletlen) generálást kérhet. Minden játék egyenlegéről kerül levonásra a tét, és csak akkor érvényes, ha a befizetés sikeresen megtörtént.`
      },
      {
        title: 'Általános szabályok',
        list: [
          'A játékban való részvételhez regisztráció és a 18. életév betöltése szükséges.',
          'A sorsolások rögzített időpontokban történnek (az adott játék leírásában találja a pontos menetrendet).',
          'Nyertes találatok esetén a kisebb nyeremények automatikusan jóváírásra kerülnek az egyenlegén.',
          'Kombinációs játék, többszörös fogadás és egyéb speciális opciók az adott játék részletes leírásában olvashatók.',
          'A szabályok változhatnak, a hatályos verziót mindig itt, az oldalon tesszük közzé.',
        ]
      },
      {
        title: '🎱 Ötös Lottó',
        content: '90 számból kell 5-öt kiválasztani. A cél, hogy minél többet eltaláljon a hetente sorsolt 5 nyerőszám közül. Már 2 találattal is nyerhet. A főnyereményt az 5 találat jelenti. Játszható 1 vagy több hétre előre, saját számokkal vagy gépi generálással.'
      },
      {
        title: '🎱 Skandináv Lottó',
        content: '35 számból kell 7-et kiválasztani. Hetente két sorsolás történik. Legalább 4 találat szükséges a nyereményhez. A főnyereményt a 7 találat jelenti. Játszható saját számokkal vagy véletlen generálással, 1 vagy 5 hétre.'
      },
      {
        title: '🌍 Eurojackpot',
        content: 'Nemzetközi lottójáték: az „A" mezőn 50 számból 5-öt, a „B" mezőn 12 számból 2-t kell megjelölni. Heti két sorsolás (kedd és péntek). Már alacsonyabb találatokkal is nyerhet, a főnyeremény akár több tízmillió euró is lehet.'
      },
      {
        title: '🃏 Joker',
        content: 'Kiegészítő játék több lottó mellett. Egy 6 jegyű számot kell megjátszani. A nyeréshez a kisorsolt Joker szám utolsó 2–6 számjegyét kell sorrendben eltalálni. Fix nyeremények a találatok számától függően.'
      },
      {
        title: '🎲 Kenó',
        content: '80 számból legfeljebb 10 számot jelölhet meg. Naponta többször sorsolnak 20 nyerőszámot. Minél több találat, annál nagyobb a nyeremény. Bizonyos tétszámoknál akkor is nyerhet, ha 0 találata van.'
      },
      {
        title: '🎱 Hatos Lottó',
        content: '45 számból kell 6-ot kiválasztani. Már 3 találattal is nyerhet. A főnyereményt a 6 találat jelenti. Játszható saját számokkal vagy gépi generálással, több sorsolásra előre.'
      },
    ]
  },

  nyeremenyek: {
    icon: DollarSign,
    color: '#16a34a',
    bg: '#dcfce7',
    title: 'Nyeremények kifizetése',
    badge: 'Pénzügyek',
    sections: [
      {
        title: 'Hogyan kapja meg nyereményét?',
        content: 'Nyereményeit az alábbi módon veheti fel a Fortuna Lottón:'
      },
      {
        title: 'Kisebb nyeremények (600 000 Ft alatt)',
        content: 'Automatikusan jóváíródnak a játékosi egyenlegén, ahonnan bármikor kifizethető bankszámlára utalhatja.'
      },
      {
        title: 'Nagyobb nyeremények',
        content: 'Személyes azonosítás után banki átutalással történik a kifizetés a regisztrációban megadott, saját nevére szóló magyarországi bankszámlára.'
      },
      {
        title: 'Fontos tudnivalók',
        list: [
          'A kifizetés előtt a hatályos adószabályok szerinti levonások (pl. SZJA) alkalmazásra kerülnek.',
          'A nyeremény igénylésére a sorsolás napjától számított 90 nap áll rendelkezésre.',
          'Az igénylési határidő elmulasztása esetén a nyeremény elveszik.',
          'Minden kifizetés biztonsági ellenőrzésen esik át a csalások megelőzése érdekében.',
          'Pontos limitek és eljárás az adott nyeremény összegétől függ.',
        ]
      },
    ]
  },

  felelosjatek: {
    icon: Heart,
    color: '#dc2626',
    bg: '#fee2e2',
    title: 'Felelős játék',
    badge: 'Védelem',
    sections: [
      {
        title: 'A felelős játék fontossága',
        content: 'Számunkra fontos a játékosok védelme. A szerencsejáték szórakozás, nem bevételi forrás. Elkötelezettek vagyunk abban, hogy minden játékos biztonságos és kellemes környezetben játsszon.'
      },
      {
        title: 'Mit tehet a felelős játékért?',
        list: [
          'Állítson be napi/heti/havi befizetési és tétlimiteket a fiókjában.',
          'Használja az önkorlátozás funkcióját (pl. ideiglenes vagy végleges kizárás).',
          'Figyelje a játékidejét és költését – soha ne játsszon többet, mint amennyit megengedhet magának elveszíteni.',
          'Ne játsszon alkohol vagy más befolyásoló szerek hatása alatt.',
          'Ne tekintse a szerencsejátékot bevételi forrásnak vagy adósság törlesztési eszköznek.',
        ]
      },
      {
        title: 'Segítség',
        content: 'Ha úgy érzi, hogy a játék problémát okoz, forduljon szakemberhez. Magyarországon elérhető a Szerencsejáték Zrt. Felelős Játékszervezés oldala, vagy a Kék Vonal segélyvonal (116-123). Ha segítségre van szüksége a limitek beállításában vagy kizárásban, lépjen kapcsolatba ügyfélszolgálatunkkal.'
      },
      {
        title: '⚠️ Figyelmeztetés',
        content: 'A túlzásba vitt szerencsejáték függőséget okozhat. A szerencsejáték kizárólag 18 éven felülieknek ajánlott.'
      },
    ]
  },

  adatvedelem: {
    icon: Shield,
    color: '#2563eb',
    bg: '#eff6ff',
    title: 'Adatvédelmi irányelvek',
    badge: 'GDPR',
    sections: [
      {
        title: 'Adatvédelmi elkötelezettségünk',
        content: 'A Fortuna Lotto elkötelezett az Ön személyes adatainak védelme iránt, és a GDPR valamint a magyar adatvédelmi törvények teljes körű betartásával kezeli azokat.'
      },
      {
        title: 'Milyen adatokat kezelünk?',
        list: [
          'Regisztrációs adatok (név, e-mail, születési dátum, lakcím).',
          'Játékadatok (tett tétek, választott számok, tranzakciók).',
          'Technikai adatok (IP-cím, böngészőadatok) a szolgáltatás biztosításához.',
        ]
      },
      {
        title: 'Adatkezelés célja',
        content: 'A játék nyújtása, nyeremények kifizetése, jogszabályi kötelezettségek teljesítése, csalásmegelőzés és marketing (csak hozzájárulás esetén).'
      },
      {
        title: 'Az Ön jogai',
        list: [
          'Hozzáférés a saját adataihoz.',
          'Adatok helyesbítése.',
          'Adatok törlése ("elfeledtetéshez való jog").',
          'Adatkezelés korlátozása.',
          'Tiltakozás az adatkezelés ellen.',
        ]
      },
      {
        title: 'Kapcsolat',
        content: 'Kéréseit az adatvedelem@fortunalotto.hu címre küldheti. Adattovábbítás csak jogszabályi kötelezettség vagy szolgáltatók (pl. fizetési szolgáltatók) felé, szerződéses garanciákkal történik.'
      },
    ]
  },

  feltetelek: {
    icon: FileCheck,
    color: '#7c3aed',
    bg: '#f5f3ff',
    title: 'Felhasználási feltételek',
    badge: 'Jogi',
    sections: [
      {
        title: 'Általános rendelkezések',
        content: 'Ezen feltételek szabályozzák a Fortuna Lotto oldal használatát. Az oldal használatával Ön elfogadja ezeket a feltételeket. Kérjük, figyelmesen olvassa el őket.'
      },
      {
        title: 'Főbb szabályok',
        list: [
          'Csak 18 éven felüliek regisztrálhatnak és játszhatnak.',
          'A fiók egy személyre szól, tilos átruházni vagy megosztani.',
          'Tilos mindenfajta csalás, automatizált játék vagy visszaélés.',
          'Ilyen esetben a fiók felfüggesztésre vagy törlésre kerül.',
          'A társaság fenntartja a jogot a szolgáltatás módosítására vagy szüneteltetésére.',
          'Vitás esetekben a magyar jog az irányadó, a jogvitákat magyar bíróságok döntik el.',
        ]
      },
      {
        title: 'Módosítások',
        content: 'A feltételek bármikor módosíthatók, a változásokat az oldalon közzétesszük. Kérjük, rendszeresen ellenőrizze őket. A módosítások közzétételét követő folyamatos használat a feltételek elfogadásának minősül.'
      },
    ]
  },

  gyik: {
    icon: HelpCircle,
    color: '#db2777',
    bg: '#fdf2f8',
    title: 'GYIK – Gyakori kérdések',
    badge: 'Segítség',
    sections: [
      {
        title: 'Hogyan regisztrálhatok?',
        content: 'Kattintson a „Regisztráció" gombra az oldal jobb felső sarkában, töltse ki az adatokat (felhasználónév, e-mail, jelszó), majd erősítse meg az e-mail címét a kapott levélben.'
      },
      {
        title: 'Hogyan fizethetek be pénzt?',
        content: 'Bankkártyával (Visa/Mastercard) a „Feltöltés" gombra kattintva a fiókjában. Új játékosoknak 5 000 Ft bónusz jár az első befizetéshez!'
      },
      {
        title: 'Mikor vannak a sorsolások?',
        content: 'Minden játék saját menetrenddel rendelkezik. Az Ötös Lottó szombaton, a Skandináv Lottó szerdán és szombaton, az Eurojackpot kedden és pénteken, a Kenó naponta többször kerül sorsolásra.'
      },
      {
        title: 'Hogyan ellenőrizhetem a nyerőszámokat?',
        content: 'A „Szelvényeim" menüpontban a fiókjában, illetve e-mail értesítést kap minden sorsolás eredményéről.'
      },
      {
        title: 'Elfelejtettem a jelszavamat.',
        content: 'Használja a bejelentkezési oldalon az „Elfelejtetted?" funkciót. A megadott e-mail címre küldünk egy visszaállítási linket, ami 1 óráig érvényes.'
      },
      {
        title: 'Van ügyfélszolgálat?',
        content: 'Igen! Elérhetőségek: E-mail: support@fortunalotto.hu | Telefon: +36 1 234 5678 | Hétfőtől péntekig 9:00–17:00 között.'
      },
      {
        title: 'Mennyi idő alatt kapom meg a nyereményemet?',
        content: 'Kisebb nyeremények azonnal jóváíródnak az egyenlegén. Nagyobb nyeremények esetén 1-3 munkanap alatt kerül sor a kifizetésre az azonosítást követően.'
      },
    ]
  },
};

const InfoPage = ({ page, onBack }) => {
  const content = PAGES[page];
  if (!content) return null;

  const Icon = content.icon;

  return (
    <Container className="py-4" style={{ maxWidth: '860px' }}>
      {/* Vissza gomb */}
      <button
        onClick={onBack}
        className="btn btn-outline-secondary mb-4 d-flex align-items-center gap-2"
      >
        <ArrowLeft size={18} /> Vissza a főoldalra
      </button>

      {/* Fejléc */}
      <div className="d-flex align-items-center gap-3 mb-5">
        <div className="p-3 rounded-3 d-flex align-items-center justify-content-center"
          style={{ background: content.bg, minWidth: '56px', height: '56px' }}>
          <Icon size={28} style={{ color: content.color }} />
        </div>
        <div>
          <Badge className="mb-1" style={{ background: content.color }}>{content.badge}</Badge>
          <h1 className="fw-bold mb-0">{content.title}</h1>
        </div>
      </div>

      {/* Szekciók */}
      <div className="d-flex flex-column gap-4">
        {content.sections.map((section, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3" style={{ color: content.color }}>
                {section.title}
              </h5>
              {section.content && (
                <p className="text-muted mb-0">{section.content}</p>
              )}
              {section.list && (
                <ul className="text-muted mb-0 ps-3">
                  {section.list.map((item, j) => (
                    <li key={j} className="mb-2">{item}</li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Vissza gomb alul */}
      <div className="mt-5 text-center">
        <button onClick={onBack} className="btn btn-warning fw-bold px-5 rounded-pill">
          Vissza a játékokhoz
        </button>
      </div>
    </Container>
  );
};

export default InfoPage;