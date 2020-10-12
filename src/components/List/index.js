import React, { Component } from 'react';
import Module from '../Module';
import axios from 'axios';

import './List.scss';
import SearchInput from "../SearchInput";
import {Button, Form, Container, Grid} from "semantic-ui-react";


export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modules: [],
            search: "",
            galleryStyle: true
        }
    }

    getModules = (nextPageLink = null, reset = false) => {
        const url = nextPageLink !== null ? nextPageLink : "https://packagist.org/search.json?per_page=15&type=thelia-module&q="+this.state.search;

        axios.get(url, {

        })
            .then(response => {
                const responseModules = response.data.results.map(function (module) {
                    const moduleVendorAndPackage = module.name.split('/');
                    return {
                        vendor:moduleVendorAndPackage[0],
                        package:moduleVendorAndPackage[1],
                        ...module
                    };
                });

                let modules = reset ? responseModules : this.state.modules.concat(responseModules);
                // handle success
                this.setState({
                    modules: modules,
                    nextPageLink: response.data.next ?? null
                });
            })
            .catch(error => {
                // handle error
                console.log(error);
            })
    }

    doSearch = (search) => {
        window.history.pushState('Search', 'Search Thelia modules ' + search, '?q='+search);

        this.setState({
            search: search
        }, () => {
            this.getModules(null, true);
        })
    }

    switchListStyle = () => {
        this.setState((prevState, props) => {
            return {galleryStyle: !prevState.galleryStyle};
        });
    }

    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const search = urlParams.get('q');

        this.doSearch(search);
    }


    render() {
        const { modules, nextPageLink, galleryStyle } = this.state;
        const columnButtonIcon = galleryStyle ? 'th list' : 'th';
        const numberOfColumns = galleryStyle ? 3 : 1;

        return (
            <div>
                <Container>
                    <Form>
                        <Form.Group widths='equal'>
                            <SearchInput doSearch={this.doSearch} textAlign='center' defaulValue={this.state.search}/>
                            <Button onClick={() => {this.switchListStyle()}} icon={columnButtonIcon}  className={"large secondary"}/>
                        </Form.Group>
                    </Form>
                </Container>
                <Container fluid={galleryStyle} className="List" style={{ padding: 40 }}>
                    <Grid divided="vertically">
                        <Grid.Row columns={numberOfColumns} >
                            {modules.map((module, index) => <Grid.Column style={{ marginBottom: 40 }} key={module.package}><Module {...module} /></Grid.Column>)}
                        </Grid.Row>
                    </Grid>
                </Container>
                <Container textAlign='center' style={{marginBottom:"1em"}}>
                    {nextPageLink !== null ? <Button className={"secondary"}  content="See more" onClick={() => {this.getModules(nextPageLink)}}/> : null}
                </Container>
            </div>
        )
    }
}
