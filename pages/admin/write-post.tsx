import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import Layout from "../../components/layout"
import Head from "next/head"
import Header from '../../components/header'
import Link from "next/link"
import { data } from "../../lib/data"
import rehypeSanitize from "rehype-sanitize";
import { grabText } from "../../lib/grabText";
import Alert from '../../components/alert'
import Restricted from "../../components/restricted";

import styles from '../../styles/dashboard.module.css'
import utilStyles from '../../styles/utils.module.css'
import addPostStyles from '../../components/addPostForm.module.css'

import { text } from '../../lib/data'


// -----------------------------------------------------------
// NEXT.JS configuration for @uiw
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    {
        loading: () => <p>{text.writePost.loading}</p>,
        ssr: false
    },
);
// ------------------------------------------------------------ 

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const SAVE_TOKEN = process.env.NEXT_PUBLIC_SAVE_TOKEN;

export default function WritePost() {
    const { data: session } = useSession()

    const [value, setValue] = useState(`${text.writePost.title} \n ${text.writePost.body}`);
    const [authorName, setAuthorName] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState();
    const [published, setPublished] = useState();


    useEffect(() => {
        if (JSON.parse(localStorage.getItem('postText'))) {
            setValue(JSON.parse(localStorage.getItem('postText')))
        }
        if (JSON.parse(localStorage.getItem('postAuthor'))) {
            setAuthorName(JSON.parse(localStorage.getItem('postAuthor')))
        }
        if (JSON.parse(localStorage.getItem('postDescription'))) {
            setDescription(JSON.parse(localStorage.getItem('postDescription')))
        }
    }, [])

    const handleChange = (e) => {
        localStorage.setItem(
            'postText',
            JSON.stringify(e)
        );
        setValue(e)
    }

    const handleFormChange = (e) => {
        const authorName = e.target.form.author.value;
        const description = e.target.form.description.value;
        localStorage.setItem(
            'postAuthor',
            JSON.stringify(authorName)
        );
        localStorage.setItem(
            'postDescription',
            JSON.stringify(description)
        );
        setAuthorName(authorName)
        setDescription(description)
    }


    function cancelAction() {
        setStatus(null)
    }

    const handlePublish = async (e) => {
        e.preventDefault()

        const rawData = {
            fileContent: value,
            authorName: authorName || "Default Author",
            description: description,
        }

        const format = await fetch(`${BASE_URL}/format-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SAVE_TOKEN}`
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(rawData)
        })

        if (!format.ok) {
            if (format.status === 409) {

                const errorMsg = await format.json();
                console.log(errorMsg.title)
                if (errorMsg.title === "missing") {
                    setStatus({ alert: "bodyAlert", message: `${text.writePost.missingTitle}` })
                    return
                }
                if (errorMsg.title === "duplicated") {
                    setStatus({ alert: "bodyAlert", message: `${text.writePost.titleExists}` })
                    return;
                }
                if (errorMsg.title === "body") {
                    setStatus({ alert: "bodyAlert", message: `${text.writePost.noText}` })
                    return;
                }
            }
            setStatus({ alert: "bodyAlert", message: `${text.writePost.errorFormatting}` })
            return;
        }

        const postData = await format.json()
        const newPost = postData.newPost

        setStatus({ alert: "messageAlert", message: `${text.writePost.publishing}` })

        const publish = await fetch(`${BASE_URL}/save-post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SAVE_TOKEN}`
            },
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(newPost)
        })

        if (publish.ok) {
            localStorage.removeItem('postText')
            localStorage.removeItem('postAuthor')
            localStorage.removeItem('postDescription')
            setStatus({ alert: "messageAlert", message: `${text.writePost.postPublished}` })
            setPublished(true)
        } else {
            const errorMsg = await publish.json();
            setStatus({ alert: "bodyAlert", message: errorMsg.error })
        }
        return
    }

    if (session) {

        return (
            <Layout home dashboard>
                <Header />
                <Head>
                    <title>{data.title} - {text.writePost.writePost}</title>
                </Head>
                <h2>{text.writePost.newPost}</h2>
                <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>

                    {!published ? (
                        <div className={`${styles.parent}`}>
                            {status ? (
                                <Alert data={status} cancelAction={cancelAction} downloadFile={undefined} deletePost={undefined} resetCounter={undefined} />
                            ) : null}
                            <div>
                                <form className={addPostStyles.form} onChange={handleFormChange} encType="multipart/form-data">
                                    <label htmlFor="author">{text.addPostForm.authorName}</label>
                                    <input type="text" name="author" placeholder={text.addPostForm.authorPlaceholder} value={authorName} />
                                    <label htmlFor="description">{text.addPostForm.description}</label>
                                    <input type="textarea" name="description" placeholder={text.addPostForm.descriptionPlaceholder} value={description} />
                                </form>
                                <MDEditor className={styles.editor} value={value} onChange={handleChange} textareaProps={{ spellCheck: true }}
                                    previewOptions={{
                                        rehypePlugins: [[rehypeSanitize]]
                                    }}
                                />
                            </div>
                            <div className={styles.btnContainer}>
                                <button className={`${styles.button} ${styles.buttonPublish}`} onClick={handlePublish}>{text.writePost.publish}</button>
                            </div>
                        </div>
                    ) : (
                        <Alert data={status} cancelAction={cancelAction} downloadFile={undefined} deletePost={undefined} resetCounter={undefined} />
                    )}
                    <div className={styles.btnContainer}>
                        <Link href='/admin/dashboard'>
                            <a>← {text.writePost.goDashboard}</a>
                        </Link>
                    </div>
                </section >
            </Layout >
        )
    }

    return (
        <Restricted />
    )
}