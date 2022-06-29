import React, { useEffect, useState } from 'react';
import { withNamespaces } from 'react-i18next';
import { connect, useDispatch } from 'react-redux';
import { compose } from 'redux';
import { useHistory } from 'react-router';
import { ipcRenderer } from 'electron';
import { toast, ToastContainer } from 'react-toastify';
import routes from '../constants/routes.json';
import { HomeApi } from '../api/HomeApi';

interface AboutUsScreenProps {
  t: any,
  lng: 'en' | 'zh' | 'fr';
}


function AboutUsScreen(props: AboutUsScreenProps) {
  const rootCategoryList = [
    'discipline_course',
    'tvet_course',
    'professional_course',
  ];

  const rootCategoryCodeList = [
    'discipline_courses',
    'tvet-related_courses',
    'professional_development_courses',
  ];

  const history = useHistory();
  const { t, lng} = props;
  const [show, setShow] = useState(false);

  const [disciplineList, setDisciplineList] = useState<any[]>([]);
  const [tvetList, setTvetList] = useState<any[]>([]);
  const [professionalList, setProfessionalList] = useState<any[]>([]);
  const videoURL = `https://iioe-files.iioe.org/video/iioe_intro_${lng == 'zh' ? "cn" : lng}.mp4`

  useEffect(()=> {
    console.log('dadada======' + lng);
    prefetch_file(videoURL, onSuccess, onProgress, onError)
  }, []);

  useEffect(() => {
    const params = {
      size: '2',
      page: '0'
    };
    params['rootCategoryCode'] = rootCategoryCodeList[0];
    HomeApi.list(params)
      .then((response: any) => {
        setDisciplineList(response['content'])
        return 0;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = {
      size: '2',
      page: '0'
    };
    params['rootCategoryCode'] = rootCategoryCodeList[1];
    HomeApi.list(params)
      .then((response: any) => {
        setTvetList(response['content'])
        return 0;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = {
      size: '2',
      page: '0'
    };
    params['rootCategoryCode'] = rootCategoryCodeList[2];
    HomeApi.list(params)
      .then((response: any) => {
        setProfessionalList(response['content'])
        return 0;
      })
      .catch(() => {});
  }, []);

  function _renderList(list: any[]): JSX.Element {
    const elements:JSX.Element[] = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      elements.push(
        <button className="org-item" onClick={()=> {
          setTimeout(() => {
            history.push(routes.COURSE + item['id']);
          }, 150);
        }}>
          <div className="org-left"></div>
          <div className="org-right">
              <div className="org-right-top">{item['name']}</div>
              <div className="org-right-bottom">{item['educationName']}</div>
          </div>
        </button>
      );
    }
    return (
      <div className="course-main">
        {
          elements
        }
      </div>
    );
  }

  function onSuccess(url) {
    console.log(url);
    var video:any = document.createElement('VIDEO')
    if (!video.src) {
        video.id = 'video';
        document.body.appendChild(video);
        video.src = url
      }
  }

  function onProgress() {

  }

  function onError() {
    setTimeout(() => {
      prefetch_file(videoURL, onSuccess, onProgress, onError);
    }, 400);
  }

  function prefetch_file(url,
                        fetched_callback,
                        progress_callback,
                        error_callback) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "blob";

      xhr.addEventListener("load", function () {
          if (xhr.status === 200) {
              var URL = window.URL || window.webkitURL;
              var blob_url = URL.createObjectURL(xhr.response);
              fetched_callback(blob_url);
          } else {
              error_callback();
          }
      }, false);

      var prev_pc = 0;
      xhr.addEventListener("progress", function (event) {
          if (event.lengthComputable) {
              var pc = Math.round((event.loaded / event.total) * 100);
              if (pc != prev_pc) {
                  prev_pc = pc;
                  progress_callback(pc);
              }
          }
      });
      xhr.send();
  }

  function _renderENContent():JSX.Element {
    return (
      <div className="about-us-container">
        <div className="about-top">
          <div className="about-top-header">
            <img className="top-cover" alt="top-cover" src="images/about_us_top.png"/>
            <div className="top-content">
              <div className="title">WHO WE ARE</div>
              <div className="top-deatil">
                <div className="video">
                  <img className="cover" alt="iioe-intro" src="images/intro_cover.png" />
                  <button className="button-intro en" onClick={()=> {
                    setShow(true);
                  }}>
                    <img alt="iioe-intro" src="images/icon_intro_play.png"/>
                    <div className="intro-text">IIOE at a glance</div>
                  </button>
                </div>
                <div className="detail-text">
                  <p>The International Institute of Online Education (IIOE) initiative is proposed by the International Centre for Higher Education Innovation under the auspices of UNESCO (UNESCO-ICHEI) with its partner higher education institutions (HEIs) in developing countries in Africa and Asia-Pacific, and its partner enterprises and HEIs in China.</p>
                  <p> he proposal is developed based on the framework of Belt & Road initiative of talent training and establishment of mechanisms for cooperative development across countries that draws on the Silk Road Spirit of "peace and cooperation, openness and inclusiveness, mutual learning and mutual benefit”.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-top-main">
            <div className="title">IIOE as a Springboard towards Education 2030 in Higher Education and SDG4</div>
            <div className="main-header">
              <img src="images/icon_target.png" alt="target-header" />
              <div className="main-content">IIOE provides specific strategies for realising UN SDG 4 - Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all, and helps partner HEIs in developing countries to realise the targets of Education 2030, enhance international collaboration in higher education, promote knowledge exchange, and provide quality and inclusive access to lifelong learning.</div>
            </div>
            <div className="target-list">
              <div className="target-item">
                <img src="images/icon_target_1.png" alt="target-item" />
                <div className="item-content">Enhancing teachers’ competencies to implement ICT in higher education for their professional growth</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_2.png" alt="target-item" />
                <div className="item-content">Strengthening HEIs’ capacity and institutional environment for online and blended learning ecosystem</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_3.png" alt="target-item" />
                <div className="item-content">Providing in-demand equitable quality higher educational resources for sustainable development</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_4.png" alt="target-item" />
                <div className="item-content">Leveraging AI and future technologies in higher education to improve personalisation and better learning outcomes for talent cultivation</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_5.png" alt="target-item" />
                <div className="item-content">Establishing a rich connection between higher education graduates and market-driven competencies to form a productive human capital for socio-economic advancement</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_6.png" alt="target-item" />
                <div className="item-content">Improving access to quality higher education for women and marginalised communities to empower them by seizing decent opportunities</div>
              </div>
            </div>
          </div>
        </div>
        <div className="about-main">
          <div className="main-item first">
            <div className="header">HOW WE WORK</div>
            <div className="title">
              <div className="sequent">1</div>
              <div className="sequent-desc">
                <div className="desc-text">A robust platform for teachers' ICT competency</div>
                <div className="desc-text">A higher education hub for future skills</div>
              </div>
            </div>
            <div className="item-top">
              <div className="top-left">
                <div className="top-desc">The IIOE platform is powered by modern systems with cloud technology that integrates high-quality teaching and learning materials, and establishes an efficient mechanism of codeveloping and sharing of quality educational resources and contents. The platform uses cutting-edge technologies such as artificial intelligence and automation to continuously optimize the user experience, and establishes a favorable environment by exploring and engaging the best potential of machine learning and deep learning to promote teaching, thereby enabling universities to achieve innovative teaching and research models. The IIOE platform will progress together with IIOE partners, multi-disciplinary stakeholders and users to meet the needs of different development stages.</div>
              </div>
              <img className="top-cover" src="images/process_cover_en.png" alt="org-process-cover"/>
            </div>
            <div className="item-desc">Based on UNESCO ICT Competency Framework for Teachers and all-round IT skills, a quality assurance system for HEIs and an ICT competency assessment system for teachers have been created. IIOE provides training programs comprising assessment, courses, tools and practice to support partner HEIs' capacity building and teachers' professional development.</div>
            <div className="item-cover">
              <img src="images/org_process_en.png" alt="org-process" />
            </div>
          </div>
          <div className="main-item second">
            <div className="title">
              <div className="sequent">2</div>
              <div className="sequent-desc">
                <div className="desc-text">Professional Development for University Teachers</div>
                <div className="desc-text">Competency Assessment systems and quality course resources</div>
              </div>
            </div>
            <div className="main-text">IIOE is an open educational resources (OERs) platform through a joint contribution and shared benefits mechanism to promote popularization and quality enhancement of higher education in the developing world. The main focus of IIOE is to improve teachers' capacity of ICT application in teaching and learning through providing quality online courses and professional development opportunities. Regarding the professional development, it is expected that teachers of partner HEIs have certain capacity for IIOE implementation in the local context and successful implementation of IIOE will continuously promote teachers ICT competencies.</div>
            <div className="main-text"> Based on the Mechanism of Course Support and Service, the IIOE Secretariat will provide the following support for teacher professional development: building capacity and skill assessment for key teachers; providing tools and resources for promoting teachers' capacity on ICT in education; organising a team of experts to support teacher professional development; and providing QA guidelines for online courses. The IIOE curriculum framework and skill assessment are based on UNESCO ICT Competency Framework for Teachers together with request skills of professions on new technologies.</div>
            <div className="bottom-list">
              <div className="bottom-item">
                <div className="bottom-title">UNESCO ICT Competency Framework for Teachers</div>
                <div className="framework">
                  <div className="cover">
                    <img src="images/ict_framework.png" alt="framework-cover" />
                    <button className="button-framework en" onClick={()=> {
                       setShow(true);
                    }}>
                      <img alt="iioe-intro" src="images/icon_intro_play.png"/>
                      <div className="framwork-text">WATCH VIDEO</div>
                    </button>
                  </div>
                  <div className="framework-desc">
                    <p className="framework-text">The ICT Competency Framework for Teachers (ICT-CFT) published by UNESCO in 2018 covers six dimensions: understanding ICT in education policy; curriculum and assessment; pedagogy; application of digital skills; organization and administration; and teacher professional learning.</p>
                    <p>The ICT-CFT Version 3 is a tool to guide pre- and in- service teacher training on the use of ICTs across the education system. It is intended to be adapted and contextualized to support national and institutional goals. It addresses recent technological and pedagogical developments in the field of ICT and Education and incorporates inclusive principles of non- discrimination, open and equitable information accessibility and gender equality in the delivery of education supported by technology.</p>
                  </div>
                </div>
              </div>
              <div className="bottom-item">
                <div className="bottom-title">Quality Course Resources</div>
                <p>According to the status-quo of higher education in Asia-Pacific and Africa, IIOE has designed a curriculum structure comprised of discipline courses, TVET courses and teacher professional development courses to enhance teacher's capacity of ICT application in teaching and learning.</p>
                <div className="course-list">
                  <div className="course-item">
                    <div className="course-top">
                      <img src="images/principle_course.png" alt="principle course" />
                      <div className="cover-field">
                        <div className="course-name">Disciplines</div>
                        <button onClick={()=> {
                          history.push(routes.COURSELIST + rootCategoryList[0]);
                        }}>
                          <img className="course-jump" alt="jump course list" src="images/icon_intro_jump.png" />
                        </button>
                      </div>
                    </div>
                    {
                      _renderList(disciplineList)
                    }
                  </div>
                  <div className="course-item">
                    <div className="course-top">
                      <img src="images/employee_course.png" alt="employee course" />
                      <div className="cover-field">
                        <div className="course-name">Vocational Education Courses</div>
                        <button onClick={()=> {
                          history.push(routes.COURSELIST + rootCategoryList[1]);
                        }}>
                          <img className="course-jump" alt="jump course list" src="images/icon_intro_jump.png" />
                        </button>
                      </div>
                    </div>
                    {
                      _renderList(tvetList)
                    }
                  </div>
                  <div className="course-item">
                    <div className="course-top">
                      <img src="images/teacher_course.png" alt="teacher course" />
                      <div className="cover-field">
                        <div className="course-name">Teacher Education Courses</div>
                        <button onClick={()=> {
                          history.push(routes.COURSELIST + rootCategoryList[2]);
                        }}>
                          <img className="course-jump" alt="jump course list" src="images/icon_intro_jump.png" />
                        </button>
                      </div>
                    </div>
                    {
                      _renderList(professionalList)
                    }
                  </div>
                </div>
              </div>
              <div className="bottom-item">
                <div className="bottom-title">Competency Assessment Systems</div>
                <p>The assessment system includes two components：Assessment of ICT Competency for Teachers and Assessment of Skill Stack. Assessment of ICT Competency for Teachers is based on the UNESCO ICT Competency Framework for Teachers. It could evaluate teachers' capacity level in six aspects：Understanding ICT in Education, Curriculum and Assessment, Pedagogy, Application of Digital Skills, Organization and Administration, Teacher Professional Learning. Skill Stack Assessment is based on artificial intelligence algorithms. This system could evaluate the level of ICT-related skills in the following areas: Office Skills, ICT General Skills, Analysis and Development Skills in Big Data, Skills in Artificial Intelligence Areas, Operation and Development Skills in Cloud Computing.</p>
              </div>
            </div>
          </div>
          <div className="main-item third">
            <div className="title">
              <div className="sequent">3</div>
              <div className="sequent-desc">
                <div className="desc-text">Quality Assurance</div>
              </div>
            </div>
            <p className="third-text">IIOE aims to build partner HEIs’ capacity for online and blended teaching and learning to realise higher education innovation. IIOE together with a team of international online education experts developed the IIOE Quality Assurance (QA) Framework. IIOE QA Framework aims to provide a comprehensive guidance to support partner HEIs to improve institutional capacity for online and blended teaching and learning, which will facilitate partner HEIs to implement IIOE.</p>
            <p className="third-text">The development of the IIOE QA Framework draws upon international QA frameworks and at the same time takes into full consideration of higher education condition in developing countries in Africa and Asia. IIOE QA Framework is not only a framework for assessment, but also a framework for benchmark.</p>
            <p className="third-text">In order to make IIOE QA Framework be more accessible by HEIs and be more user-friendly, IIOE developed an IIOE QA self-assessment tool with an expert team based on the IIOE QA Framework. IIOE self-assessment is composed of 6 components, 20 sub-components and and 61 measurement areas. HEIs could use the IIOE QA self-assessment tool to make a comprehensive assessment of their institution’s performance in online and blended teaching and learning. At the end of the assessment, there will be a self-assessment report that could provide advice and recommendations on how institutions might improve on online and blended teaching and learning.</p>
          </div>
        </div>
        <div className="about-bottom">
          <div className="bottom-title">Mapping the Future</div>
          <div className="bottom-desc">The project countries of IIOE including Cambodia, China, Djibouti, Egypt, Ethiopia, Gambia, Kenya, Mongolia, Nigeria, Pakistan, Sri Lanka and Uganda.</div>
          <div className="bottom-cover">
            <img src="images/blueprint_en.png" alt="blueprint" />
          </div>
          <div className="bottom-detail">IIOE intends to first extend its reach to more HEIs in countries that are part of the UNESCO-China Funds-in-Trust and UNESCO-Shenzhen Funds-in-Trust. These countries are all from Africa and they are Cote d’lvoire, Malawi, Mali, Namibia, Niger, Senegal, Togo, and Zambia. At the same time, IIOE is open to develop partnerships with more HEIs from other developing countries.</div>
        </div>
        {
          show ?
          <div className="video-container">
            <button className="mask" onClick={()=> {setShow(false)}}/>
            <div className="video-content">
              <video controls autoPlay disablePictureInPicture>
                <source src={videoURL}/>
              </video>
            </div>
          </div>
          :
          <div/>
        }
      </div>
    );
  }

  function _renderFRContent():JSX.Element {
    return (
      <div className="about-us-container">
        <div className="about-top">
          <div className="about-top-header">
            <img className="top-cover" alt="top-cover" src="images/about_us_top.png"/>
            <div className="top-content">
              <div className="title">À propos de nous</div>
              <div className="top-deatil">
                <div className="video">
                  <img className="cover" alt="iioe-intro" src="images/intro_cover.png" />
                  <button className="button-intro fr" onClick={()=> {
                    setShow(true);
                  }}>
                    <img alt="iioe-intro" src="images/icon_intro_play.png"/>
                    <div className="intro-text">Brève présentation de l'IIOE</div>
                  </button>
                </div>
                <div className="detail-text fr">
                  <p>À l’initiative du Centre international pour l’innovation dans l’enseignement supérieur sous les auspices de l’UNESCO (Shenzhen, Chine), un projet de l’Institut </p>
                  <p>International d’Education en ligne (IIOE), a été élaboré en collaboration avec ses partenaires universitaires dans les pays en développement d’Asie-Pacifique et d’Afrique, ainsi que ses entreprises et ses établissements d’enseignement supérieur partenaires de la Chine. Conçu sous la direction de l'initiative « une Ceinture et une Route », conformément à l'esprit de la Route de la soie, soit « la paix et la coopération, l’ouverture et l’inclusion, l’apprentissage mutuel, et les bénéfices réciproques », le projet vise à promouvoir la mise en place des mécanismes de développement coopératif entre les pays en formant les talents et facilitant la mobilité personnelle. </p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-top-main">
            <div className="title">L'IIOE en tant que tremplin l'ODD 4 - Éducation 2030</div>
            <div className="main-header">
              <img src="images/icon_target.png" alt="target-header" />
              <div className="main-content fr">Guidé par le « Cadre d’action d’Éducation 2030 » « vers une éducation inclusive et équitable de qualité et un apprentissage tout au long de la vie pour tous », l'IIOE cherche à aider les établissements partenaires des pays en développement à renforcer leurs capacités pour accroître leur accès à un enseignement supérieur de qualité.</div>
            </div>
            <div className="target-list">
              <div className="target-item">
                <img src="images/icon_target_1.png" alt="target-item" />
                <div className="item-content">Développer la capacité des enseignants en matière de TIC dans l’éducation</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_2.png" alt="target-item" />
                <div className="item-content">Renforcer les capacités et l’environnement institutionnel des EES partenaires pour l’apprentissage en ligne et mixte</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_3.png" alt="target-item" />
                <div className="item-content">Fournir, à la demande, des ressources éducatives de haute qualité pour un développement durable et équitable</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_4.png" alt="target-item" />
                <div className="item-content">Utiliser l'intelligence artificielle pour améliorer la formation personnalisée des talents à l'ère numérique</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_5.png" alt="target-item" />
                <div className="item-content">Établir un pont entre les diplômés de l’enseignement supérieur et la demande de compétences du marché du travail</div>
              </div>
              <div className="target-item">
                <img src="images/icon_target_6.png" alt="target-item" />
                <div className="item-content">Améliorer l’accès à une éducation supérieure de qualité pour les femmes et les communautés marginalisées afin de les encourager à saisir les opportunités décentes</div>
              </div>
            </div>
          </div>
        </div>
        <div className="about-main">
          <div className="main-item first">
            <div className="header">Comment cela fonctionne-t-il ?</div>
            <div className="title">
              <div className="sequent">1</div>
              <div className="sequent-desc">
                <div className="desc-text">Plate-forme puissante pour les</div>
                <div className="desc-text">compétences des enseignants en TIC Centre d'enseignement supérieur pour les compétences du futur</div>
              </div>
            </div>
            <div className="item-top">
              <div className="top-left">
                <div className="top-desc">The IIOE platform is powered by modern systems with cloud technology that integrates high-quality teaching and learning materials, and establishes an efficient mechanism of codeveloping and sharing of quality educational resources and contents. The platform uses cutting-edge technologies such as artificial intelligence and automation to continuously optimize the user experience, and establish a favorable environment by exploring and engaging the best potential of machine learning and deep learning to promote teaching, thereby enabling universities to achieve innovative teaching and research models. The IIOE platform will progress together with IIOE partners, multi-disciplinary stakeholders and users to meet the needs of different development stages.</div>
              </div>
              <img className="top-cover" src="images/process_cover_fr.png" alt="org-process-cover"/>
            </div>
            <div className="item-desc">Sur la base du TIC UNESCO, Référentiel de compétences pour les enseignants, l'IIOE a développé un système d'assurance qualité pour les EES et un système d'évaluation des compétences en TIC pour les enseignants. L'IIOE propose des formations, y compris l'évaluation, les cours, les outils, la pratique, afin de renforcer les capacités des EES partenaires et de soutenir le développement professionnel de leurs enseignants.</div>
            <div className="item-cover">
              <img src="images/org_process_fr.png" alt="org-process" />
            </div>
          </div>
          <div className="main-item second">
            <div className="title">
              <div className="sequent">2</div>
              <div className="sequent-desc">
                <div className="desc-text">Développement professionnel des enseignants universitaires</div>
                <div className="desc-text">Système d'évaluation et ressources de cours de qualité</div>
              </div>
            </div>
            <div className="main-text">L’IIOE est une plate-forme de ressources éducatives ouvertes élaborée conjointement par ses institutions et entreprises partenaires avec le principe de « contribution conjointe et bénéfices partagés » pour promouvoir la vulgarisation de l’enseignement supérieur et l'amélioration de sa qualité dans les pays en développement. L'objectif principal de l’IIOE est de perfectionner les compétences des enseignants en TIC dans l'enseignement et l'apprentissage. Les enseignants des universités partenaires de l’IIOE devraient avoir une certaine maîtrise des TIC. Au fur et à mesure de sa mise en œuvre, l’IIOE continuera à améliorer les compétences des enseignants en TIC en qualité d’élément important pour leur développement professionnel.</div>
            <div className="main-text">Sur la base du Mécanisme de Support et Service des cours, le Secrétariat de l’IIOE prendra les mesures d'accompagnement suivantes pour le développement professionnel des enseignants : renforcement des capacités et évaluation des enseignants, outils et ressources pour les compétences des enseignants en TIC, équipe d'experts pour soutenir le développement professionnel des enseignants et le guide d'AQ pour les cours en ligne. Le cadre du curriculum de l’IIOE et l’évaluation des compétences sont basés sur le TIC UNESCO, le référentiel de compétences pour les enseignants ainsi que sur les compétences requises des professions dans les nouvelles technologies.</div>
            <div className="bottom-list">
              <div className="bottom-item">
                <div className="bottom-title">TIC UNESCO-Référentiel de compétences pour les enseignants</div>
                <div className="framework">
                  <div className="cover">
                    <img src="images/ict_framework.png" alt="framework-cover" />
                    <button className="button-framework fr" onClick={()=> {
                       setShow(true);
                    }}>
                      <img alt="iioe-intro" src="images/icon_intro_play.png"/>
                      <div className="framwork-text">Regarder Cette Vidéo</div>
                    </button>
                  </div>
                  <div className="framework-desc">
                    <p className="framework-text">En 2018, l'UNESCO a publié le TIC UNESCO, Référentiel de compétences pour les enseignants, qui définit les compétences TIC en six dimensions : politique éducationnelle des TIC, cursus et évaluation, pédagogie, application des compétences numériques, organisation et administration, apprentissage professionnel des enseignants.</p>
                    <p>La troisième édition du TIC UNESCO constitue une ligne directrice expliquant l'utilisation des TIC aux enseignants en formation ou en cours d’emploi. Ceci a pour but de soutenir les objectifs tant nationaux qu’institutionnels. Il aborde les récents développements technologiques et pédagogiques dans le domaine éducatif et de TIC en préconisant les principes inclusifs et antidiscriminatoires, l’accès libre et équitable des informations, l'égalité des sexes dans la prestation d'enseignement soutenue par la technologie.</p>
                  </div>
                </div>
              </div>
              <div className="bottom-item">
                <div className="bottom-title">Ressources de cours de qualité</div>
                <p>Conformément au statu quo de l'enseignement supérieur en Asie-Pacifique et en Afrique, l'IIOE a conçu une structure de programme comprenant trois types de cours : les cours liés à la discipline, les cours liés à l'EFTP et les cours de développement professionnel des enseignants.</p>
                <div className="course-list">
                  <div className="course-item">
                    <div className="course-top">
                      <img src="images/principle_course.png" alt="principle course" />
                      <div className="cover-field">
                        <div className="course-name">Cours thématiques</div>
                        <button onClick={()=> {
                          history.push(routes.COURSELIST + rootCategoryList[0]);
                        }}>
                          <img className="course-jump" alt="jump course list" src="images/icon_intro_jump.png" />
                        </button>
                      </div>
                    </div>
                    {
                      _renderList(disciplineList)
                    }
                  </div>
                  <div className="course-item">
                    <div className="course-top">
                      <img src="images/employee_course.png" alt="employee course" />
                      <div className="cover-field">
                        <div className="course-name">Cours d'EFTP</div>
                        <button onClick={()=> {
                          history.push(routes.COURSELIST + rootCategoryList[1]);
                        }}>
                          <img className="course-jump" alt="jump course list" src="images/icon_intro_jump.png" />
                        </button>
                      </div>
                    </div>
                    {
                      _renderList(tvetList)
                    }
                  </div>
                  <div className="course-item">
                    <div className="course-top">
                      <img src="images/teacher_course.png" alt="teacher course" />
                      <div className="cover-field">
                        <div className="course-name">Cours de développement professionnel pour les enseignants</div>
                        <button onClick={()=> {
                          history.push(routes.COURSELIST + rootCategoryList[2]);
                        }}>
                          <img className="course-jump" alt="jump course list" src="images/icon_intro_jump.png" />
                        </button>
                      </div>
                    </div>
                    {
                      _renderList(professionalList)
                    }
                  </div>
                </div>
              </div>
              <div className="bottom-item">
                <div className="bottom-title">Système d'évaluation de compétences</div>
                <p>Le système d'évaluation comprend deux volets : évaluation des compétences en TIC des enseignants et évaluation des compétences générales. L'évaluation des compétences en TIC des enseignants, basée sur le TIC UNESCO, Référentiel de compétences pour les enseignants, consiste à évaluer le niveau de capacité des enseignants sous six aspects : compréhension des TIC dans l'éducation, cursus et évaluation, pédagogie, application des compétences numériques, organisation et administration et apprentissage professionnel des enseignants. L'évaluation des compétences générales est basée sur des algorithmes d'intelligence artificielle. Ce système pourrait évaluer le niveau de compétences liées aux TIC dans les domaines suivants : compétences bureautiques, compétences générales en TIC, compétences d'analyse et de développement en Big Data, compétences dans les domaines de l'intelligence artificielle, compétences d'exploitation et de développement dans le cloud computing.</p>
              </div>
            </div>
          </div>
          <div className="main-item third">
            <div className="title">
              <div className="sequent">3</div>
              <div className="sequent-desc">
                <div className="desc-text">Assurance Qualité</div>
              </div>
            </div>
            <p className="third-text">L'IIOE vise à renforcer la capacité des EES partenariaux en matière d'enseignement en ligne et mixte pour inspirer des innovations dans l'enseignement supérieur. L'IIOE, avec une équipe d'experts internationaux de l'éducation en ligne, a établi le cadre d'Assurance Qualité (QA). Le Cadre de QA de l'IIOE vise à aider les EES partenaires à améliorer la capacité institutionnelle d'enseignement en ligne et mixte, ce qui facilitera la mise en œuvre de l'IIOE dans les EES partenaires.</p>
            <p className="third-text">Le Cadre de QA de l'IIOE s'appuie sur les cadres internationaux de QA et il prend pleinement en considération les conditions de l'enseignement supérieur dans les pays en développement d'Afrique et d'Asie. Le Cadre de QA de l'IIOE n'est pas seulement un cadre d'évaluation, mais aussi un cadre de référence.</p>
            <p className="third-text">Afin de rendre le Cadre de QA de l'IIOE plus accessible aux EES, l'IIOE a développé un outil d'auto-évaluation de QA avec une équipe d'experts. L'auto-évaluation est composée de 6 modules, 20 indicateurs et 61 domaines d'évaluation. Les EES partenariaux pourraient utiliser l'outil d'auto-évaluation pour effectuer une évaluation complète des performances de leur établissement en matière d'enseignement en ligne et mixte. À la fin de l'évaluation, il y aura un rapport d'auto-évaluation qui pourrait fournir des conseils et des recommandations, ce qui permettront aux institutions d’améliorer l'enseignement en ligne et mixte.</p>
          </div>
        </div>
        <div className="about-bottom">
          <div className="bottom-title">Plan pour l'avenir</div>
          <div className="bottom-desc">Les pays du projet de l’IIOE sont Cambodge, Chine, Djibouti, Égypte, Éthiopie, Gambie, Kenya, Mongolie, Nigéria, le Pakistan, Sri Lanka et Ouganda.</div>
          <div className="bottom-cover">
            <img src="images/blueprint_fr.png" alt="blueprint" />
          </div>
          <div className="bottom-detail">L'IIOE entend d'abord étendre sa portée à un plus grand nombre d'EES dans les pays africains faisant partie du Fonds-en-dépôt UNESCO-Chine et du Fonds-en-dépôt UNESCO-Shenzhen. Ce sont, parmi eux, la Côte d’Ivoire, le Malawi, le Mali, la Namibie, le Niger, le Sénégal, le Togo et la Zambie. Dans le même temps, l'IIOE souhaite développer des partenariats avec plus d'EES d'autres pays en développement.</div>
        </div>
        {
          show ?
          <div className="video-container">
            <button className="mask" onClick={()=> {setShow(false)}}/>
            <div className="video-content">
              <video controls autoPlay disablePictureInPicture>
                <source src={videoURL}/>
              </video>
            </div>
          </div>
          :
          <div/>
        }
      </div>
    );
  }

  if (lng === 'en') {
    return _renderENContent();
  }
  else if (lng === 'fr') {
    return _renderFRContent();
  }

  return (
    <div className="about-us-container">
      <div className="about-top">
        <div className="about-top-header">
          <img className="top-cover" alt="top-cover" src="images/about_us_top.png"/>
          <div className="top-content">
            <div className="title">关于我们</div>
            <div className="top-deatil">
              <div className="video">
                <img className="cover" alt="iioe-intro" src="images/intro_cover.png" />
                <button className="button-intro" onClick={()=> {
                  setShow(true);
                }}>
                  <img alt="iioe-intro" src="images/icon_intro_play.png"/>
                  <div className="intro-text">IIOE简介</div>
                </button>
              </div>
              <div className="detail-text">
                <p>国际网络教育学院（International Institute of Online Education，IIOE）项目由联合国教科文组织高等教育创新中心（中国深圳）牵头，与亚太、非洲地区发展中国家的伙伴院校、中国的伙伴院校和企业共同发起设立。</p>
                <p> 该项目的设计是在“一带一路”倡议的指引下，秉持“和平合作、开放包容、互学互鉴、互利共赢 ”的丝绸之路精神，通过人才培养与交流，推动建立国家之间合作发展机制。</p>
              </div>
            </div>
          </div>
        </div>
        <div className="about-top-main">
          <div className="title">IIOE助力实现高等教育2030年目标和可持续发展目标4</div>
          <div className="main-header">
            <img src="images/icon_target.png" alt="target-header" />
            <div className="main-content">IIOE为实现联合国可持续发展目标4提供了具体策略，即确保包容和公平的优质教育并为所有人提供终身学习机会；IIOE帮助发展中国家的高等教育机构合作伙伴实现2030年教育目标，加强高等教育方面的国际合作，促进知识交流，并提供优质和包容的终身学习机会。</div>
          </div>
          <div className="target-list">
            <div className="target-item">
              <img src="images/icon_target_1.png" alt="target-item" />
              <div className="item-content">发展高校教师的ICT能力</div>
            </div>
            <div className="target-item">
              <img src="images/icon_target_2.png" alt="target-item" />
              <div className="item-content">强化高等教育机构开展在线和混合式学习生态系统的能力和环境</div>
            </div>
            <div className="target-item">
              <img src="images/icon_target_3.png" alt="target-item" />
              <div className="item-content">提供国家可持续发展所需的优质教育资源</div>
            </div>
            <div className="target-item">
              <img src="images/icon_target_4.png" alt="target-item" />
              <div className="item-content">利用人工智能提升数字时代的个性化人才培养</div>
            </div>
            <div className="target-item">
              <img src="images/icon_target_5.png" alt="target-item" />
              <div className="item-content">搭建高等教育人才能力与市场需求的桥梁</div>
            </div>
            <div className="target-item">
              <img src="images/icon_target_6.png" alt="target-item" />
              <div className="item-content">提升女性以及被边缘化群体获得优质高等教育的机会</div>
            </div>
          </div>
        </div>
      </div>
      <div className="about-main">
        <div className="main-item first">
          <div className="header">如何运作</div>
          <div className="title">
            <div className="sequent">1</div>
            <div className="sequent-desc">
              <div className="desc-text">强大可靠的云平台</div>
              <div className="desc-text">赋能培养未来技能的高等教育集群</div>
            </div>
          </div>
          <div className="item-top">
            <div className="top-left">
              <div className="top-desc">IIOE平台基于互联网和云技术，集成优质教学资源并建立高效的共建共享机制。平台将利用人工智能等前沿技术不断优化用户体验，为探索机器学习和深度学习促进教学搭建有利环境，从而使大学实现创新的教学研究模式。IIOE平台将与IIOE伙伴和用户共同成长，满足不同发展阶段的需求。</div>
            </div>
            <img className="top-cover zh" src="images/process_cover.png" alt="org-process-cover"/>
          </div>
          <div className="item-desc">IIOE的教师专业发展，依据联合国教科文组织教师ICT能力框架以及IT全技能点，制定了机构质量保证机制和教师ICT能力等级测评系统；IIOE提供集成测评、课程、工具和实践四位一体的培训项目来支持伙伴大学机构能力建设和教师专业发展。</div>
          <div className="item-cover">
            <img src="images/org_process.png" alt="org-process" />
          </div>
        </div>
        <div className="main-item second">
          <div className="title">
            <div className="sequent">2</div>
            <div className="sequent-desc">
              <div className="desc-text">强大可靠的云平台</div>
              <div className="desc-text">赋能培养未来技能的高等教育集群</div>
            </div>
          </div>
          <div className="main-text">IIOE的伙伴院校和企业共同打造一个"共建共享"的开放教育资源平台，以培养教师ICT应用能力为重点， 为伙伴院校提供前沿的ICT相关的优质在线课程和教师专业发展的机会，促进发展中国家高等教育普及和质量提升。 IIOE合作伙伴高校的教师应当具备一定的ICT素养，实施IIOE的过程也将会不断继续提高教师的ICT能力，作为教师专业发展的重要部分。</div>
          <div className="main-text">根据课程支持和服务机制，联合国教科文组织高等教育创新中心将作为IIOE秘书处为教师专业发展提供以下服务：教师的能力建设和测评、 教师的信息通信技术能力的工具和资源包、组建专家小组以支持教师的专业发展规划、提供在线课程的质量检查指南。 IIOE提供的课程框架和测评系统是基于联合国教科文组织教师ICT能力框架以及新技术领域全技能点。</div>
          <div className="bottom-list">
            <div className="bottom-item">
              <div className="bottom-title">联合国教科文组织教师ICT能力框架</div>
              <div className="framework">
                <div className="cover">
                  <img src="images/ict_framework.png" alt="framework-cover" />
                  <button className="button-framework" onClick={()=> {
                     setShow(true);
                  }}>
                    <img alt="iioe-intro" src="images/icon_intro_play.png"/>
                    <div className="framwork-text">观看视频</div>
                  </button>
                </div>
                <div className="framework-desc">
                  <p className="framework-text">2018年，联合国教科文组织（UNESCO）发布了《教师ICT能力框架》，该框架从理解教育ICT政策、课程与评价、教学法、应用数字技能、组织和行政管理、教师专业学习这六个维度描述了教师的ICT能力。</p>
                  <p>能力框架第三版是一个覆盖全教育系统职前和职内教师培训使用ICT的指导纲要，用于支持国家和机构层面的应用。它针对近年来技术和教育发展在教育信息化领域，提倡包容的、反歧视的、开放和公平的信息获取，以及技术支持的教育获取的性别平等。</p>
                </div>
              </div>
            </div>
            <div className="bottom-item">
              <div className="bottom-title">优质课程资源</div>
              <p>IIOE根据亚太和非洲地区高等教育的实际情况，设计了聚焦ICT的课程体系，分为学科教育课程、职业技术课程和教师专业发展课程三类。</p>
              <div className="course-list">
                <div className="course-item">
                  <div className="course-top">
                    <img src="images/principle_course.png" alt="principle course" />
                    <div className="cover-field">
                      <div className="course-name">学科课程</div>
                      <button onClick={()=> {
                        history.push(routes.COURSELIST + rootCategoryList[0]);
                      }}>
                        <img className="course-jump" alt="jump course list" src="images/icon_intro_jump.png" />
                      </button>
                    </div>
                  </div>
                  {
                    _renderList(disciplineList)
                  }
                </div>
                <div className="course-item">
                  <div className="course-top">
                    <img src="images/employee_course.png" alt="employee course" />
                    <div className="cover-field">
                      <div className="course-name">职业教育课程</div>
                      <button onClick={()=> {
                        history.push(routes.COURSELIST + rootCategoryList[1]);
                      }}>
                        <img className="course-jump" alt="jump course list" src="images/icon_intro_jump.png" />
                      </button>
                    </div>
                  </div>
                  {
                    _renderList(tvetList)
                  }
                </div>
                <div className="course-item">
                  <div className="course-top">
                    <img src="images/teacher_course.png" alt="teacher course" />
                    <div className="cover-field">
                      <div className="course-name">教师教育课程</div>
                      <button onClick={()=> {
                        history.push(routes.COURSELIST + rootCategoryList[2]);
                      }}>
                        <img className="course-jump" alt="jump course list" src="images/icon_intro_jump.png" />
                      </button>
                    </div>
                  </div>
                  {
                    _renderList(professionalList)
                  }
                </div>
              </div>
            </div>
            <div className="bottom-item">
              <div className="bottom-title">能力测评系统</div>
              <p>测评系统包括2个部分，即教师ICT能力测评和技能栈测评。教师ICT能力测评是以联合国教科文组织《教师ICT能力框架》为原型，测量教师在6方面的能力：理解教育中的ICT、课程与评估教学法、数字技能应用、组织与管理、教师专业学习。技能栈测评是一套基于人工智能算法的系统，可以测量ICT相关技能的掌握水平，包括：办公通用、技术通用、大数据分析和开发、人工智能、云计算运维与开发等技能。</p>
            </div>
          </div>
        </div>
        <div className="main-item third">
          <div className="title">
            <div className="sequent">3</div>
            <div className="sequent-desc">
              <div className="desc-text">质量保证</div>
            </div>
          </div>
          <p className="third-text">IIOE旨在加强伙伴院校开展在线和混合式教学的能力，从而促进伙伴院校实现高等教育创新。基于此，IIOE与全球的在线教育专家共同研究制定了《IIOE质量保证框架》。《IIOE质量保证框》架旨在为伙伴院校提供全面的指导，帮助伙伴院校提升机构能力开展在线和混合式教学，从而帮助伙伴院校实施IIOE。</p>
          <p className="third-text">IIOE质量保证框架的开发参考了国际已有的质量保证框架， 并充分考虑亚非发展中国家高等教育的发展情况。《IIOE质量保证框架》不仅是评估的框架， 也是基准框架。</p>
          <p className="third-text">为方便伙伴院校使用《IIOE质量保证框架》开展机构测评， IIOE与专业团队合作开发了IIOE质量保证测评工具。IIOE质量保证测评包括六大模块， 20个指标点和61个测评领域。 伙伴院校可以通过IIOE质量保证测评工具对其机构开展在线和混合式教学的能力做出全面评估。 测评结束后伙伴院校将获得一份评估报告，报告内有针对测评结果给出的建议和意见。</p>
        </div>
      </div>
      <div className="about-bottom">
        <div className="bottom-title">未来蓝图</div>
        <div className="bottom-desc">IIOE现有项目国包括柬埔寨、中国、吉布提、埃及、埃塞俄比亚、冈比亚、肯尼亚、蒙古、尼日利亚、巴基斯坦、斯里兰卡、乌干达。</div>
        <div className="bottom-cover">
          <img src="images/blueprint.png" alt="blueprint" />
        </div>
        <div className="bottom-detail">项目的初期是与11所创新中心的伙伴院校合作，同时也会加入联合国教科文组织-中国信托基金和深圳信托基金中涉及的相关非洲国家，包括科特迪瓦、马拉维、马里、纳米比亚、尼日尔、塞内加尔、多哥和赞比亚。IIOE也向其他发展中国家开放，希望更多的大学加入。</div>
      </div>
      {
        show ?
        <div className="video-container">
          <button className="mask" onClick={()=> {setShow(false)}}/>
          <div className="video-content">
            <video controls autoPlay disablePictureInPicture>
              <source src={videoURL}/>
            </video>
          </div>
        </div>
        :
        <div/>
      }
    </div>
  )
}


function makeMapStateToProps() {
  return function(state: any) {
    return {
      offlineList: state.offline.offlineList,
    };
  }
}

export default compose(
  withNamespaces(),
  connect(makeMapStateToProps)
)(AboutUsScreen) as React.ComponentType;
