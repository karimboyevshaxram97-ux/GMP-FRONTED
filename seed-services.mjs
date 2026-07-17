/**
 * GMP — Test services seed script
 * Run: node seed-services.mjs
 * Delete all created data: node seed-services.mjs --delete
 */

const GQL = 'http://localhost:3007/graphql';

async function gql(query, variables = {}, token = null) {
	const res = await fetch(GQL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify({ query, variables }),
	});
	const json = await res.json();
	if (json.errors) throw new Error(json.errors[0].message);
	return json.data;
}

// ── 1. Login ─────────────────────────────────────────────────────────────────
async function login(phoneOrEmail, password) {
	const data = await gql(`
		mutation Login($input: LoginInput!) {
			login(input: $input) { accessToken }
		}
	`, { input: { phoneNumber: phoneOrEmail, password } });
	return data.login.accessToken;
}

// ── 2. Create agency ──────────────────────────────────────────────────────────
async function createAgency(token, input) {
	const data = await gql(`
		mutation CreateAgency($input: CreateAgencyInput!) {
			createAgency(input: $input) { _id name { en } }
		}
	`, { input }, token);
	return data.createAgency;
}

// ── 3. Approve agency ─────────────────────────────────────────────────────────
async function approveAgency(token, agencyId) {
	const data = await gql(`
		mutation ApproveAgency($input: ApproveAgencyInput!) {
			approveAgency(input: $input) { _id verificationStatus }
		}
	`, { input: { agencyId } }, token);
	return data.approveAgency;
}

// ── 4. Create service ─────────────────────────────────────────────────────────
async function createService(token, agencyId, input) {
	const data = await gql(`
		mutation CreateService($agencyId: String!, $input: CreateServiceInput!) {
			createService(agencyId: $agencyId, input: $input) { _id name { en } serviceType price }
		}
	`, { agencyId, input }, token);
	return data.createService;
}

// ── 5. Delete service ─────────────────────────────────────────────────────────
async function deleteService(token, serviceId) {
	const data = await gql(`
		mutation DeleteService($serviceId: String!) {
			deleteService(serviceId: $serviceId)
		}
	`, { serviceId }, token);
	return data.deleteService;
}

// ── Test data ─────────────────────────────────────────────────────────────────
const SERVICES = [
	// STUDY_ABROAD
	{
		name: { uz: 'Koreada tahsil', ru: 'Учёба в Корее', en: 'Study in South Korea', ko: '한국 유학' },
		description: { uz: "South Korea's top universities", ru: "Ведущие университеты Кореи", en: "Full admission support for South Korea's top universities. TOPIK preparation included.", ko: '한국 유학 지원' },
		serviceType: 'STUDY_ABROAD',
		destinationCountry: 'South Korea',
		sourceCountries: ['Uzbekistan', 'Kazakhstan', 'Kyrgyzstan'],
		price: 1800,
		processingTime: '4–8 weeks',
		tags: ['korea', 'university', 'topik'],
	},
	{
		name: { uz: 'Germaniyada magistratura', ru: 'Магистратура в Германии', en: "Master's in Germany", ko: '독일 석사' },
		description: { uz: 'Nemis universitetlarida magistratura', ru: 'Магистратура в немецких университетах', en: "Full support for master's programs at German universities. Language course + visa included.", ko: '독일 대학원 지원' },
		serviceType: 'STUDY_ABROAD',
		destinationCountry: 'Germany',
		sourceCountries: ['Uzbekistan', 'Kazakhstan'],
		price: 2400,
		processingTime: '6–12 weeks',
		tags: ['germany', 'master', 'europe'],
	},
	{
		name: { uz: 'Polshada bakalavr', ru: 'Бакалавриат в Польше', en: "Bachelor's in Poland", ko: '폴란드 학사' },
		description: { uz: "Polsha universitetlarida o'qish", ru: 'Обучение в польских университетах', en: "Affordable bachelor's programs in Poland. Full document support and enrollment.", ko: '폴란드 학사 지원' },
		serviceType: 'STUDY_ABROAD',
		destinationCountry: 'Poland',
		sourceCountries: ['Uzbekistan'],
		price: 1200,
		processingTime: '4–6 weeks',
		tags: ['poland', 'bachelor', 'affordable'],
	},
	{
		name: { uz: 'Yaponiyada til kursi', ru: 'Языковые курсы в Японии', en: 'Language Course in Japan', ko: '일본 어학 연수' },
		description: { uz: "Yaponiyada yapon tili kursi", ru: 'Курсы японского языка в Японии', en: "Japanese language schools with student visa support. 6–12 month programs available.", ko: '일본어 학교 지원' },
		serviceType: 'STUDY_ABROAD',
		destinationCountry: 'Japan',
		sourceCountries: ['Uzbekistan', 'Kazakhstan', 'Kyrgyzstan'],
		price: 2200,
		processingTime: '6–10 weeks',
		tags: ['japan', 'language', 'jlpt'],
	},

	// WORK_ABROAD
	{
		name: { uz: 'Polshada mehnat viza', ru: 'Рабочая виза в Польшу', en: 'Work Visa for Poland', ko: '폴란드 취업 비자' },
		description: { uz: 'Polshada rasmiy ish uchun hujjat rasmiylashtrish', ru: 'Оформление документов для официальной работы в Польше', en: "Official work permit and visa processing for Poland. Job matching assistance included.", ko: '폴란드 취업 비자 발급 지원' },
		serviceType: 'WORK_ABROAD',
		destinationCountry: 'Poland',
		sourceCountries: ['Uzbekistan', 'Kazakhstan', 'Tajikistan'],
		price: 900,
		processingTime: '3–6 weeks',
		tags: ['poland', 'work', 'permit'],
	},
	{
		name: { uz: 'Germaniyada ish viza', ru: 'Рабочая виза в Германию', en: 'Work Visa for Germany', ko: '독일 취업 비자' },
		description: { uz: "Germaniyada IT va muhandislik sohasida ish", ru: 'Работа в Германии в сфере IT и инженерии', en: "Skilled worker visa for Germany. IT, engineering, and healthcare professionals.", ko: '독일 숙련 노동자 비자' },
		serviceType: 'WORK_ABROAD',
		destinationCountry: 'Germany',
		sourceCountries: ['Uzbekistan', 'Kazakhstan'],
		price: 1600,
		processingTime: '8–14 weeks',
		tags: ['germany', 'it', 'engineering'],
	},
	{
		name: { uz: 'Dubayda ish topish', ru: 'Трудоустройство в Дубае', en: 'Job Placement in Dubai', ko: '두바이 취업' },
		description: { uz: "Dubayda mehnat bozorida ish topish", ru: 'Поиск работы на рынке труда Дубая', en: "End-to-end job placement in Dubai. CV preparation, interview coaching, and work visa.", ko: '두바이 취업 비자 발급 지원' },
		serviceType: 'WORK_ABROAD',
		destinationCountry: 'UAE',
		sourceCountries: ['Uzbekistan', 'Tajikistan', 'Kyrgyzstan'],
		price: 1100,
		processingTime: '4–8 weeks',
		tags: ['dubai', 'uae', 'placement'],
	},

	// TRAVEL
	{
		name: { uz: 'Turkiya sayohat paketi', ru: 'Тур-пакет в Турцию', en: 'Turkey Tour Package', ko: '터키 여행 패키지' },
		description: { uz: "Turkiyaga 7 kunlik tur paketi", ru: '7-дневный тур-пакет в Турцию', en: "7-day all-inclusive Turkey tour. Istanbul, Cappadocia, Pamukkale. Hotel + flights.", ko: '7일 터키 패키지 여행' },
		serviceType: 'TRAVEL',
		destinationCountry: 'Turkey',
		sourceCountries: ['Uzbekistan'],
		price: 650,
		processingTime: '3–5 days',
		tags: ['turkey', 'tour', 'all-inclusive'],
	},
	{
		name: { uz: 'Yaponiya turizm viza', ru: 'Туристическая виза в Японию', en: 'Japan Tourist Visa', ko: '일본 관광 비자' },
		description: { uz: "Yaponiyaga turizm viza rasmiylashtirish", ru: 'Оформление туристической визы в Японию', en: "Japan tourist visa processing with full document support. Single and multiple entry.", ko: '일본 관광 비자 발급' },
		serviceType: 'TRAVEL',
		destinationCountry: 'Japan',
		sourceCountries: ['Uzbekistan', 'Kazakhstan'],
		price: 280,
		processingTime: '2–4 weeks',
		tags: ['japan', 'tourist', 'visa'],
	},

	// VISA_SERVICES
	{
		name: { uz: 'AQSh tourist vizasi', ru: 'Туристическая виза США', en: 'US Tourist Visa (B1/B2)', ko: '미국 관광 비자' },
		description: { uz: "AQShga B1/B2 turizm/biznes vizasi", ru: 'Туристическая/деловая виза в США B1/B2', en: "Full support for US B1/B2 visa. DS-160, interview prep, and appointment booking.", ko: '미국 B1/B2 비자 신청 지원' },
		serviceType: 'VISA_SERVICES',
		destinationCountry: 'USA',
		sourceCountries: ['Uzbekistan', 'Kazakhstan', 'Kyrgyzstan', 'Tajikistan'],
		price: 450,
		processingTime: '4–10 weeks',
		tags: ['usa', 'b1b2', 'interview'],
	},
	{
		name: { uz: 'Shengen viza', ru: 'Шенгенская виза', en: 'Schengen Visa', ko: '쉥겐 비자' },
		description: { uz: "Yevropa Shengen maydoni uchun viza", ru: 'Виза для Шенгенской зоны Европы', en: "Schengen visa for 26 European countries. All documentation and appointment support.", ko: '유럽 쉥겐 비자 신청 지원' },
		serviceType: 'VISA_SERVICES',
		destinationCountry: 'Europe',
		sourceCountries: ['Uzbekistan', 'Kazakhstan', 'Kyrgyzstan'],
		price: 380,
		processingTime: '3–6 weeks',
		tags: ['schengen', 'europe', 'tourist'],
	},
	{
		name: { uz: 'Koreya D-2 talaba vizasi', ru: 'Студенческая виза Кореи D-2', en: 'Korea D-2 Student Visa', ko: '한국 D-2 학생 비자' },
		description: { uz: "Koreya D-2 talaba viza rasmiylashtirish", ru: 'Оформление студенческой визы Кореи D-2', en: "Korea D-2 student visa processing for university admission. TOPIK score support.", ko: '한국 D-2 학생 비자 발급 지원' },
		serviceType: 'VISA_SERVICES',
		destinationCountry: 'South Korea',
		sourceCountries: ['Uzbekistan', 'Kazakhstan'],
		price: 320,
		processingTime: '3–5 weeks',
		tags: ['korea', 'd2', 'student'],
	},
];

// ── Main ──────────────────────────────────────────────────────────────────────
const CREATED_IDS_FILE = './seed-created-ids.json';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const isDelete = process.argv.includes('--delete');

if (isDelete) {
	if (!existsSync(CREATED_IDS_FILE)) {
		console.log('❌  seed-created-ids.json topilmadi. Avval seed ishlating.');
		process.exit(1);
	}
	const ids = JSON.parse(readFileSync(CREATED_IDS_FILE, 'utf-8'));
	console.log(`🗑️  ${ids.serviceIds.length} ta service o'chirilmoqda...`);

	const token = await login('admin@gmp.com', 'Admin@123456');
	for (const id of ids.serviceIds) {
		try {
			await deleteService(token, id);
			console.log(`  ✓  ${id} o'chirildi`);
		} catch (e) {
			console.log(`  ✗  ${id}: ${e.message}`);
		}
	}
	console.log('✅  Hammasi o\'chirildi!');
	process.exit(0);
}

// ── Seed ──────────────────────────────────────────────────────────────────────
console.log('🚀  GMP seed script boshlandi...\n');

let token;
try {
	token = await login('admin@gmp.com', 'Admin@123456');
	console.log('✅  Admin login muvaffaqiyatli\n');
} catch (e) {
	console.error('❌  Login xatosi:', e.message);
	console.error('    Backend ishlaymaptimi? http://localhost:3007');
	process.exit(1);
}

// Create a demo agency
let agency;
try {
	agency = await createAgency(token, {
		name: {
			uz: 'GMP Demo Agentligi',
			ru: 'Демо-агентство GMP',
			en: 'GMP Demo Agency',
			ko: 'GMP 데모 에이전시',
		},
		email: 'demo@gmp.com',
		phoneNumber: '+998901234567',
		description: {
			uz: 'Sinov uchun demo agentlik',
			ru: 'Демо-агентство для тестирования',
			en: 'Demo agency for testing purposes',
			ko: '테스트용 데모 에이전시',
		},
		operatingCountries: ['Uzbekistan', 'South Korea', 'Germany'],
		country: 'Uzbekistan',
	});
	await approveAgency(token, agency._id);
	console.log(`✅  Agency yaratildi va tasdiqlandi: ${agency.name.en} (${agency._id})\n`);
} catch (e) {
	console.error('❌  Agency yaratishda xato:', e.message);
	console.error('    Admin akkaunt SUPER_ADMIN roliga ega emasmi?');
	process.exit(1);
}

const createdServiceIds = [];
console.log('📦  Serviclar yaratilmoqda...\n');

for (const svc of SERVICES) {
	try {
		const created = await createService(token, agency._id, svc);
		createdServiceIds.push(created._id);
		console.log(`  ✓  [${created.serviceType}] ${created.name.en} — $${created.price}`);
	} catch (e) {
		console.log(`  ✗  ${svc.name.en}: ${e.message}`);
	}
}

// Save IDs for later deletion
writeFileSync(CREATED_IDS_FILE, JSON.stringify({
	agencyId: agency._id,
	serviceIds: createdServiceIds,
	createdAt: new Date().toISOString(),
}, null, 2));

console.log(`\n✅  ${createdServiceIds.length}/${SERVICES.length} service yaratildi!`);
console.log(`📄  ID lar saqlandi: seed-created-ids.json`);
console.log(`\n🗑️  O'chirish uchun: node seed-services.mjs --delete`);
